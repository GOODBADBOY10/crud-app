"use client";
import { useState, useEffect } from "react";
import {
  useWalletConnection,
  useSendTransaction,
} from "@solana/react-hooks";
import {
  getProgramDerivedAddress,
  getAddressEncoder,
  getBytesEncoder,
  type Address,
  address,
} from "@solana/kit";
import {
  getCreateJournalEntryInstructionDataEncoder,
  getUpdateJournalEntryInstructionDataEncoder,
  getDeleteJournalEntryInstructionDataEncoder,
  CRUD_PROGRAM_ADDRESS,
} from "../generated/crud";

const SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111" as Address;

export function JournalCard() {
  const { wallet, status } = useWalletConnection();
  const { send, isSending } = useSendTransaction();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<Array<{ title: string; message: string; address: Address }>>([]);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");

  const walletAddress = wallet?.account.address;

  const handleCreate = async () => {
    if (!walletAddress || !title.trim() || !message.trim()) {
      setTxStatus("Please fill in all fields");
      return;
    }

    try {
      setTxStatus("Creating entry...");

      // Derive the journal entry PDA
      const [journalEntryPda] = await getProgramDerivedAddress({
        programAddress: CRUD_PROGRAM_ADDRESS,
        seeds: [
          getBytesEncoder().encode(new TextEncoder().encode(title)),
          getAddressEncoder().encode(walletAddress),
        ],
      });

      const createInstruction = getCreateJournalEntryInstructionDataEncoder().encode({
        title,
        message,
      });

      const signature = await send({
        instructions: [
          {
            programAddress: CRUD_PROGRAM_ADDRESS,
            accounts: [
              { address: journalEntryPda, role: 1 }, // journal_entry (writable)
              { address: walletAddress, role: 3 }, // owner (writable, signer)
              { address: SYSTEM_PROGRAM_ADDRESS, role: 0 }, // system_program
            ],
            data: createInstruction,
          },
        ],
      });

      setTxStatus(`Entry created! Signature: ${signature}`);
      setTitle("");
      setMessage("");
      
      // Add to local entries list
      setEntries([...entries, { title, message, address: journalEntryPda }]);
    } catch (error) {
      console.error("Error creating entry:", error);
      setTxStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleUpdate = async (entryTitle: string, entryAddress: Address) => {
    if (!walletAddress || !editMessage.trim()) {
      setTxStatus("Please enter a message");
      return;
    }

    try {
      setTxStatus("Updating entry...");

      const updateInstruction = getUpdateJournalEntryInstructionDataEncoder().encode({
        title: entryTitle,
        message: editMessage,
      });

      const signature = await send({
        instructions: [
          {
            programAddress: CRUD_PROGRAM_ADDRESS,
            accounts: [
              { address: entryAddress, role: 1 }, // journal_entry (writable)
              { address: walletAddress, role: 3 }, // owner (writable, signer)
              { address: SYSTEM_PROGRAM_ADDRESS, role: 0 }, // system_program
            ],
            data: updateInstruction,
          },
        ],
      });

      setTxStatus(`Entry updated! Signature: ${signature}`);
      setEditingEntry(null);
      setEditMessage("");
      
      // Update local entries list
      setEntries(entries.map(e => 
        e.title === entryTitle ? { ...e, message: editMessage } : e
      ));
    } catch (error) {
      console.error("Error updating entry:", error);
      setTxStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (entryTitle: string, entryAddress: Address) => {
    if (!walletAddress) return;

    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      setTxStatus("Deleting entry...");

      const deleteInstruction = getDeleteJournalEntryInstructionDataEncoder().encode({
        title: entryTitle,
      });

      const signature = await send({
        instructions: [
          {
            programAddress: CRUD_PROGRAM_ADDRESS,
            accounts: [
              { address: entryAddress, role: 1 }, // journal_entry (writable)
              { address: walletAddress, role: 3 }, // owner (writable, signer)
              { address: SYSTEM_PROGRAM_ADDRESS, role: 0 }, // system_program
            ],
            data: deleteInstruction,
          },
        ],
      });

      setTxStatus(`Entry deleted! Signature: ${signature}`);
      
      // Remove from local entries list
      setEntries(entries.filter(e => e.title !== entryTitle));
    } catch (error) {
      console.error("Error deleting entry:", error);
      setTxStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (status !== "connected") {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Journal dApp</h2>
          <p>Please connect your wallet to use the journal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Entry Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Create Journal Entry</h2>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title (max 40 chars)</span>
            </label>
            <input
              type="text"
              placeholder="Entry title"
              className="input input-bordered"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 40))}
              maxLength={40}
            />
            <label className="label">
              <span className="label-text-alt">{title.length}/40</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Message (max 200 chars)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Your journal entry"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              maxLength={200}
            />
            <label className="label">
              <span className="label-text-alt">{message.length}/200</span>
            </label>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={isSending || !title.trim() || !message.trim()}
          >
            {isSending ? "Creating..." : "Create Entry"}
          </button>

          {txStatus && (
            <div className="alert alert-info">
              <span>{txStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Entries</h2>
          {entries.map((entry) => (
            <div key={entry.title} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{entry.title}</h3>
                
                {editingEntry === entry.title ? (
                  <div className="space-y-2">
                    <textarea
                      className="textarea textarea-bordered w-full"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value.slice(0, 200))}
                      maxLength={200}
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdate(entry.title, entry.address)}
                        disabled={isSending}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          setEditingEntry(null);
                          setEditMessage("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{entry.message}</p>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setEditingEntry(entry.title);
                          setEditMessage(entry.message);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDelete(entry.title, entry.address)}
                        disabled={isSending}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
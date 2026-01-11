#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
// use anchor_lang::system_program::{transfer, Transfer};

#[cfg(test)]
mod tests;

declare_id!("2rMvvFmGX97VYJWFTpnVgrGGptBvCcXBrGEd3BjtALXf");

#[program]
pub mod crud {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
    ) -> Result<()>{
        Ok(())
    }
}


#[derive(Accounts)]
pub struct CreateEntry<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + JournalEntrySpace::INIT_SPACE
    )]
    pub journal_entry: Account<'info, JournalEntrySpace>,
    
    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}



#[account]
#[derive(InitSpace)]
pub struct JournalEntrySpace {
    pub owner: Pubkey,
    #[max_len(20)]
    pub title: String,
    #[max_len(50)]
    pub message: String,
}
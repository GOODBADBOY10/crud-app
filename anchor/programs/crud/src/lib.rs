use anchor_lang::prelude::*;
// use anchor_lang::system_program::{transfer, Transfer};

#[cfg(test)]
mod tests;

declare_id!("qZrh75prvjbrEaPRGcqHRXFzuRUmZca9uaHTEnhvRFe");

#[program]
pub mod crud {
    use super::*;

    pub fn initialize_crud() -> Result<()> {
        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitializeCrud {}
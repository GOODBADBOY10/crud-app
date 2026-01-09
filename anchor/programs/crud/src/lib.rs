use anchor_lang::prelude::*;
// use anchor_lang::system_program::{transfer, Transfer};

#[cfg(test)]
mod tests;

declare_id!("2rMvvFmGX97VYJWFTpnVgrGGptBvCcXBrGEd3BjtALXf");

#[program]
pub mod crud {
    use super::*;

    pub fn initialize_crud() -> Result<()> {
        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitializeCrud {
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct Crud {
    #[max_len(20)]
    pub title: String,
    #[max_len(50)]
    pub description: String,
}
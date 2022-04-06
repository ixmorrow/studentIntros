use solana_program::{
    program_pack::{IsInitialized, Sealed},
};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct StudentInfo {
    pub is_initialized: bool,
    pub msg: [u8; MSG_SIZE],
}

const MSG_SIZE: usize = 128;
impl Sealed for StudentInfo {}

impl IsInitialized for StudentInfo {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

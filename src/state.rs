use solana_program::{
    program_pack::{IsInitialized, Pack, Sealed},
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct StudentInfo {
    pub test_data: u64
}

// impl Pack for StudentInfo {
//     const LEN: usize = 8;
//     fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
//         let src = array_ref![src, 0, StudenInfo::LEN];
//         let (
//             test_data
//         ) = array_refs![src, 8];

//         Ok(StudentInfo {
//             test_data: u64::from_le_bytes(*test_data),
//         })
//     }

//     fn pack_into_slice(&self, dst: &mut [u8]) {
//         let dst = array_mut_ref![dst, 0, StudentInfo::LEN];
//         let (
//             test_data_dst
//         ) = mut_array_refs![dst, 8];

//         let Escrow {
//             test_data
//         } = self;

//         *test_data_dst = test_data.to_le_bytes();
//     }
// }
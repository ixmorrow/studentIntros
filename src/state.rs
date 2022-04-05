use solana_program::{
    program_pack::{IsInitialized, Pack, Sealed},
    program_error::ProgramError,
};
use borsh::{BorshDeserialize, BorshSerialize};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use crate::error::IntroError;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, Default, PartialEq)]
pub struct StudentInfo {
    pub is_initialized: bool,
    pub msg: String,
}
const STUDENT_INFO_LEN: usize = 181;
impl Sealed for StudentInfo {}
impl StudentInfo {
    pub fn set_initialize(&mut self) {
        self.is_initialized = true;
    }

    pub fn set_name(&mut self, name: String) {
        self.msg = name;
    }
}
impl IsInitialized for StudentInfo {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for StudentInfo {
    const LEN: usize = STUDENT_INFO_LEN;
    /// Packs the initialized flag and data content into destination slice
    #[allow(clippy::ptr_offset_with_cast)]
    fn pack_into_slice(
        &self,
        dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, STUDENT_INFO_LEN];
        let (
            is_initialized_dst,
            msg_dst,
            //_padding,
         )= mut_array_refs![dst, 1, 180];

        is_initialized_dst[0] = self.is_initialized as u8;
        msg_dst.copy_from_slice(self.msg.as_bytes());
    }

     /// Unpacks the data from slice and return the initialized flag and data content
     fn unpack_from_slice(src: &[u8]) -> Result<StudentInfo, ProgramError> {
        let src = array_ref![src, 0, STUDENT_INFO_LEN];
        #[allow(clippy::ptr_offset_with_cast)]
        let (
            is_initialized_src,
            msg,
            //_padding
        )= array_refs![src, 1, 180];

        let is_initialized = match is_initialized_src {
            [0] => false,
            [1] => true,
            _ => {
                return Err(IntroError::UnpackFromSliceError.into())
            }
        };

        let vector_bytes = msg.to_vec();
        let user_info = String::from_utf8(vector_bytes).unwrap();

        Ok(Self{
            is_initialized: is_initialized,
            msg: user_info
        })
    }
}
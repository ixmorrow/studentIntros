const {
    Connection,
    sendAndConfirmTransaction,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
    TransactionInstruction,
    SYSVAR_RENT_PUBKEY,
  } = require("@solana/web3.js");
  import { Buffer } from 'buffer';
  import * as borsh from "@project-serum/borsh";

  const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
  const commitment = 'confirmed';
  const connection = new Connection(RPC_ENDPOINT_URL, commitment);
  const program_id = new PublicKey("6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr");

  const feePayer = Keypair.generate();

  const userInputIx = (i: Buffer, user: typeof PublicKey, userInfo: typeof PublicKey) => {
    return new TransactionInstruction({
      keys: [
        {
          pubkey: user,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: userInfo,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        }
      ],
      data: Buffer.concat([Buffer.from(new Uint8Array([0])), i]),
      programId: program_id,
    });
  };

  const IX_DATA_LAYOUT = borsh.struct([
    borsh.str("message")
  ]);

  const USER_ACCOUNT_DATA_LAYOUT = borsh.struct([
    borsh.u8("initialized"),
    borsh.str("message")
  ])

  async function main(userName: string) {
    console.log("Program id: " + program_id.toBase58());
    console.log("Fee payer: " + feePayer.publicKey);

    const tx = new Transaction();

    const userInfo = (await PublicKey.findProgramAddress(
      [feePayer.publicKey.toBuffer()],
      program_id
    ))[0];
    console.log("PDA: " + userInfo);

    const payload = {
      message: userName
    }
    const msgBuffer = Buffer.alloc(128);
    console.log(msgBuffer);
    IX_DATA_LAYOUT.encode(payload, msgBuffer);
    console.log(msgBuffer);

    console.log("creating init instruction");
    const ix = userInputIx(msgBuffer, feePayer.publicKey, userInfo);
    tx.add(ix);

    if ((await connection.getBalance(feePayer.publicKey)) < 1.0) {
      console.log("Requesting Airdrop of 2 SOL...");
      await connection.requestAirdrop(feePayer.publicKey, 2e9);
      console.log("Airdrop received");
    }

    let signers = [feePayer];

    console.log("sending tx");
    let txid = await sendAndConfirmTransaction(connection, tx, signers, {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    });
    console.log("tx signature " + txid);
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

    // sleep to allow time to update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const acct = await connection.getAccountInfo(userInfo);
    console.log(acct);
  }

  const getPage = async (begin, end, programId) => {
    // fetchs all accounts owned by the given program
    // the dataSlice param means we are not fetching the account data with this
    // cuts down on compute time as this call could be trying to fetching any number of accounts
    const accounts = await connection.getProgramAccounts(programId, {
      dataSlice: { offset: 0, length: 0 } // Fetch without any data.
    });
    // creates a map of all of the account pubkeys
    const pubkeys = accounts.map(account => account.pubkey)
    // slices the pubkey array to the length of parameters
    const paginatedPublicKeys = pubkeys.slice(
        begin,
        end
    );
    const len = paginatedPublicKeys.length

    if (len === 0) {
        return [];
    }

    console.log("Fetched", len,"accounts!")

    // makes another RPC call to get all of the account info for the final array of sliced pubkeys
    const accountsWithData = await connection.getMultipleAccountsInfo(paginatedPublicKeys);

    return accountsWithData;
}

  //const testPDA = new PublicKey("CWScion3mHc5Ho9BCE3bKpGynsRuia9J2FsbpiTcVNri")
  // //fetchUserAccount(testPDA)
  async function fetchUserAccount(pda: typeof PublicKey){
    const acct = await connection.getAccountInfo(pda)
    const userData = USER_ACCOUNT_DATA_LAYOUT.decode(
      acct.data
    );
    console.log("User account message:", userData.message);
  }

  async function fetchMultipleAccounts(begin, end, programId){
    const accounts = await getPage(begin, end, programId);
    for (let i=0; i< accounts.length; i++){
      let userData = USER_ACCOUNT_DATA_LAYOUT.decode(
        accounts[i].data
      );
      console.log("User message:", userData.message);
    }

  }



  fetchMultipleAccounts(0, 10, program_id)
  //fetchUserAccount(testPDA)
  //main(msg1)
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.error(e);
  });
  
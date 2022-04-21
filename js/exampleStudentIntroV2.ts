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
  //const RPC_ENDPOINT_URL = "http://localhost:8899";
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
        }
      ],
      data: i,
      programId: program_id,
    });
  };

  const IX_DATA_LAYOUT = borsh.struct([
    borsh.u8("variant"),
    borsh.str("name"),
    borsh.str("message")
  ]);

  const USER_ACCOUNT_DATA_LAYOUT = borsh.struct([
    borsh.u8("initialized"),
    borsh.str("name"),
    borsh.str("message")
  ])

  async function main(name: string, intro: string) {
    console.log("Program id: " + program_id.toBase58());
    console.log("Fee payer: " + feePayer.publicKey);

    const tx = new Transaction();

    const userInfo = (await PublicKey.findProgramAddress(
      [feePayer.publicKey.toBuffer()],
      program_id
    ))[0];
    console.log("PDA: " + userInfo);

    const payload = {
      variant: 0,
      name: name,
      message: intro
    }
    const msgBuffer = Buffer.alloc(1000);
    IX_DATA_LAYOUT.encode(payload, msgBuffer);
    console.log(msgBuffer);
    const postIxData = msgBuffer.slice(0, IX_DATA_LAYOUT.getSpan(msgBuffer));
    console.log(postIxData);

    console.log("creating init instruction");
    const ix = userInputIx(postIxData, feePayer.publicKey, userInfo);
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

    // const acct = await connection.getAccountInfo(userInfo);
    // console.log(acct);
    fetch(userInfo);
  }

  const perPage = 10;
  const getPage = async (page, pubkeys) => {
    // slices the pubkey array to the length of parameters
    const paginatedPublicKeys = pubkeys.slice(
        (page - 1) * perPage,
        page * perPage,
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

// orders accounts, but in ascending order - want descending
async function fetchOrderedAccounts(){
  const accounts = await connection.getProgramAccounts(program_id);

  const accountsWithMsg = accounts.map(({ pubkey, account }) => ({
    pubkey,
    account,
    userData: USER_ACCOUNT_DATA_LAYOUT.decode(account.data),
  }));

  const sortedAccountsWithMsg = accountsWithMsg.sort((a, b) => b.userData.message.localeCompare(
    a.userData.message,
    { ignorePunctuation: true }
    ));

  const reverseSortedAccounts = sortedAccountsWithMsg.reverse();

  const accountPublicKeys = reverseSortedAccounts.map((account) => account.pubkey);

  return accountPublicKeys
}

async function fetchMultipleAccounts(begin){
    const accountsWithoutData = await connection.getProgramAccounts(program_id,{
      dataSlice: { offset: 0, length: 0 }, // Fetch without any data.
    });
    const pubkeys = accountsWithoutData.map((account) => account.pubkey);

    const accounts = await getPage(begin, pubkeys);
    for (let i=0; i< accounts.length; i++){
      let userData = USER_ACCOUNT_DATA_LAYOUT.decode(
        accounts[i].data
      );
      console.log("User message:", userData.message);
    }

}

  async function order(){
    const orderAccts = await fetchOrderedAccounts();
    
    const orderAcctsWithData = await getPage(1, orderAccts);

    for (let i=0; i<orderAcctsWithData.length; i++) {
      let userData = USER_ACCOUNT_DATA_LAYOUT.decode(
              orderAcctsWithData[i].data
            );
            console.log("User message:", userData.message);
    }
  }

  async function fetch(pda: typeof PublicKey){
    let account = await connection.getAccountInfo(pda);

    let userData = USER_ACCOUNT_DATA_LAYOUT.decode(
      account.data
    );

    console.log("Name:", userData.name);
    console.log("Introduction:", userData.message);
  }



  const name = "Clifford"
  const intro = "im a big red dawg"
  const barney = new PublicKey("EsEnqpvKUbkrVmmwkRwtJpTHRHjTxjR1GVUy9Rp4JYxo");
  const clifford = new PublicKey("41AJ2fSo1kJGavBRwRNAP4HyDcsNefjFKVfaZFbCLa1z");

  //order()
  //fetchMultipleAccounts(1)
  fetch(barney)
  //main(name, intro)
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.error(e);
  });
  
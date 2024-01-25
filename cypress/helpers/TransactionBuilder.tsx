import {ethers} from 'ethers';
import {Transaction, secp256k1} from 'thor-devkit';

const TransactionBuilder = async (
  contractAddress: string,
  abi: any,
  method: string,
  params: any,
  wallet: any,
  provider: ethers.providers.JsonRpcProvider,
) => {
  const Counter = new ethers.utils.Interface(abi);
  const clauses = [
    {
      to: contractAddress,
      value: '0x0',
      data: Counter.encodeFunctionData(method, params),
    },
  ];

  const bestBlock = await provider.getBlock(await provider.getBlockNumber());
  const genesisBlock = await provider.getBlock(0);

  const transaction = new Transaction({
    chainTag: Number.parseInt(genesisBlock.hash.slice(-2), 16),
    blockRef: bestBlock.hash.slice(0, 18),
    expiration: 32,
    clauses,
    gas: bestBlock.gasLimit.toString().slice(0, -1),
    gasPriceCoef: 0,
    dependsOn: null,
    nonce: Date.now(),
  });

  const signingHash = transaction.signingHash();
  const signature = secp256k1.sign(signingHash, wallet.keys[0].privateKey);
  transaction.signature = signature;

  const raw = `0x${transaction.encode().toString('hex')}`;
  return raw;
};

export default TransactionBuilder;

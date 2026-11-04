const { TOKEN_BY_SYMBOL } = require('./tokens');

const POOLS = [
  {
    pair: 'BNB/BUSD',
    pairAddress: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    tokenA: TOKEN_BY_SYMBOL.BNB,
    tokenB: TOKEN_BY_SYMBOL.BUSD,
    chainId: 56,
    feeTier: '0.25%',
  },
  {
    pair: 'BNB/USDT',
    pairAddress: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE',
    tokenA: TOKEN_BY_SYMBOL.BNB,
    tokenB: TOKEN_BY_SYMBOL.USDT,
    chainId: 56,
    feeTier: '0.25%',
  },
  {
    pair: 'BNB/ETH',
    pairAddress: '0x74E4716E431f45807DCF19f284c7aA99F18a4fbc',
    tokenA: TOKEN_BY_SYMBOL.BNB,
    tokenB: TOKEN_BY_SYMBOL.ETH,
    chainId: 56,
    feeTier: '0.25%',
  },
  {
    pair: 'BNB/BTCB',
    pairAddress: '0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082',
    tokenA: TOKEN_BY_SYMBOL.BNB,
    tokenB: TOKEN_BY_SYMBOL.BTCB,
    chainId: 56,
    feeTier: '0.25%',
  },
  {
    pair: 'BNB/CAKE',
    pairAddress: '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0',
    tokenA: TOKEN_BY_SYMBOL.BNB,
    tokenB: TOKEN_BY_SYMBOL.CAKE,
    chainId: 56,
    feeTier: '0.25%',
  },
  {
    pair: 'USDT/BUSD',
    pairAddress: '0x7EFaEf62fDdCCa950418312c6C91Aef321375A00',
    tokenA: TOKEN_BY_SYMBOL.USDT,
    tokenB: TOKEN_BY_SYMBOL.BUSD,
    chainId: 56,
    feeTier: '0.25%',
  },
];

module.exports = {
  POOLS,
};

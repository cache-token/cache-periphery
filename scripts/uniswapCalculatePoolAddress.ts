import UniswapV3Pool from './abis/UniswapV3Pool.json';
import * as ethers from 'ethers';
const cc = require('eth-create2-calculator');

const bytecode = UniswapV3Pool.bytecode;
const token0 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // to determine the token0 and token1, you can inspect element and use the debugger when creating the pool to see which is which.
const token1 = "0xF5238462E7235c7B62811567E63Dd17d12C2EAA0";
const fees = 3000; // denominated in hundredths of a bip

const types = ['address', 'address', 'uint'];
const params = [token0, token1, fees];

const encodedParams = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(types, params));

// const encodedConstructorArgs = '0000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc4'
const UniswapV3FactoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const address = cc.calculateCreate2(UniswapV3FactoryAddress, encodedParams, bytecode);

console.log("UniswapV3Pool address: ", address);
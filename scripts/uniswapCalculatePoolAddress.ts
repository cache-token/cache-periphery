import UniswapV3Pool from './abis/UniswapV3Pool.json';
import * as ethers from 'ethers';
const cc = require('eth-create2-calculator');

const bytecode = UniswapV3Pool.bytecode;
const token0 = "";
const token1 = "";
const fees = 10000; // denominated in hundredths of a bip

const types = ['address', 'address', 'uint'];
const params = [token0, token1, fees];

const encodedParams = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(types, params));

// const encodedConstructorArgs = '0000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc4'
const UniswapV3FactoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const address = cc.calculateCreate2(UniswapV3FactoryAddress, encodedParams, bytecode);

console.log("UniswapV3Pool address: ", address);
import UniswapV3Pool from './abis/UniswapV3Pool.json';
import * as ethers from 'ethers';
const cc = require('eth-create2-calculator');

const bytecode = UniswapV3Pool.bytecode;
const token0 = "0x268F78793F20B11615eD5C4e076B288826E299ce"; // to determine the token0 and token1, you can inspect element and use the debugger when creating the pool to see which is which.
const token1 = "0x192Ef3FFF1708456D3A1F21354FA8d6bFd86b45c";
const fees = [100, 500, 3000, 10000]; // denominated in hundredths of a bip
const types = ['address', 'address', 'uint'];

fees.map(fee => {
    let params = [token0, token1, fee];
    let encodedParams = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(types, params));
    // let encodedConstructorArgs = '0000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc4'
    let UniswapV3FactoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
    let address = cc.calculateCreate2(UniswapV3FactoryAddress, encodedParams, bytecode);
    console.log("UniswapV3Pool address for", fee/10000+"% :", address);
});
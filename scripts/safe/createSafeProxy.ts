import hre from "hardhat";
import { ethers } from "ethers";
import { calculateProxyAddress } from "./utils/proxies";

const safeFactoryAddress = "0x76e2cfc1f5fa8f6a5b3fc4c8f4788f0116861f9b"; // check safe factory version

async function main() {

    const Factory = await hre.ethers.getContractFactory("ProxyFactory");
    const factory =  Factory.attach(safeFactoryAddress);

    // safe creation data
    const mastercopy = "";
    const initCode = ""
    const saltNonce = "";

    const proxyAddress = await calculateProxyAddress(factory, mastercopy, initCode, saltNonce);
    console.log("Calculated proxy address: ", proxyAddress);
    
    const Safe = await hre.ethers.getContractFactory("GnosisSafe");
    const decodedParams = Safe.interface.decodeFunctionData("setup", initCode);
    console.log("Creating safe with owners: ", decodedParams._owners);
    console.log("Threshold: ", decodedParams._threshold);

    const tx = await factory.createProxyWithNonce(
        mastercopy, 
        initCode, 
        saltNonce
    );
    const receipt = await tx.wait();

    const data = receipt.logs[0].data;
    const topics = receipt.logs[0].topics;
    const types = ['address'];
    const decodedParam = ethers.utils.defaultAbiCoder.decode(types, data);
    console.log("Deployed proxy at address: ", decodedParam);
}; 

main()
.then(() => {
    process.exit(0)
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
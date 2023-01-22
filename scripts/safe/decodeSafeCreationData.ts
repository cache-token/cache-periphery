import hre from "hardhat";

async function main() {
    const Safe = await hre.ethers.getContractFactory("GnosisSafe");
    
    const initData = ""; // initializer used during safe proxy creation
    const decodedParams = Safe.interface.decodeFunctionData("setup", initData);
    console.log(decodedParams);
}

main()
.then(() => {
    process.exit(0)
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
import hre from "hardhat";
import { ethers, providers } from "ethers";
import {  
    safeSignMessage, 
    buildSignatureBytes
} from "./utils/execution";
import {
    tokenAddress,
    recipientAddress,
    safeProxyAddress,
    safeOwnerAddress1,
    safeOwnerAddress2
} from "../../config.json";

const erc20Inf = new ethers.utils.Interface([  
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"
]);

async function main() {

    const provider = new providers.JsonRpcProvider("http://localhost:8545");
    await provider.send("hardhat_impersonateAccount", [safeOwnerAddress1]);
    await provider.send("hardhat_impersonateAccount", [safeOwnerAddress2]);

    const safeOwner1 = provider.getSigner(safeOwnerAddress1);
    const safeOwner2 = provider.getSigner(safeOwnerAddress2);

    const Safe = await hre.ethers.getContractFactory("GnosisSafe");
    const safe = Safe.attach(safeProxyAddress);

    const token = new ethers.Contract(tokenAddress, erc20Inf, provider);
    const tokenBalance = await token.balanceOf(safeProxyAddress);
    console.log("Current token balance: ", tokenBalance.toString());

    const encodedFunctionData = erc20Inf.encodeFunctionData("transferFrom", [
        safeProxyAddress,
        recipientAddress,
        tokenBalance
    ]);

    const safeTx = {
        to: tokenAddress,
        value: 0,
        data: encodedFunctionData,
        operation: 0,
        safeTxGas: 0,
        baseGas: 0,
        gasPrice:0,
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: 0
    };

    // const signer1 = new ethers.Wallet("", provider);
    // await signer1.sendTransaction({to: await safeOwner1.getAddress(), value: ethers.utils.parseEther("1")});
    // await signer1.sendTransaction({to: await safeOwner2.getAddress(), value: ethers.utils.parseEther("1")});

    const sig1 = await safeSignMessage(safeOwner1, safe, safeTx, 137);
    const sig2 = await safeSignMessage(safeOwner2, safe, safeTx, 137);
    const signatureBytes = buildSignatureBytes([sig1, sig2]);

    const encodedSafeTxData = Safe.interface.encodeFunctionData("execTransaction", [
        tokenAddress,
        0,
        encodedFunctionData,
        0,
        0,
        0,
        0,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        signatureBytes
    ]);

    const tx = await safeOwner1.sendTransaction({to: safeProxyAddress, data: encodedSafeTxData});
    const receipt = await tx.wait();
    console.log(receipt);
    console.log("New token balance: ", (await token.balanceOf(safeProxyAddress)).toString());
}; 

main()
.then(() => {
    process.exit(0)
})
.catch(error => {
    console.error(error);
    process.exit(1);
});
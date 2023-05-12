import { useState } from "react";
import { Box, Button, CircularProgress, Dialog, IconButton, Link, Step, StepLabel, Stepper, Typography } from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useNetwork, useSigner } from "wagmi";

import { IAppConfig } from "../models/Base";
import { getAppConfig } from "../helpers/Utilities";
import SnackbarMessage from "./Snackbar";
import { Transition } from "./Transition";
import { ISnackbarConfig } from "../models/Material";
import { errorHandler } from "../helpers/Wallet";

const Sign = () => {
  const config: IAppConfig = getAppConfig();

  const [isConfirmation, setIsConfirmation] = useState<boolean>(false);
  const [isTryAgain, setIsTryAgain] = useState<boolean>(false);
  const [isSignCompleted, setIsSignCompleted] = useState<boolean>(false);
  const [confirmationStep, setConfirmationStep] = useState<number>(0);
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy');
  const [signResponse, setSignResponse] = useState<any>();
  const [snackbar, setSnackbar] = useState<ISnackbarConfig>({
    isOpen: false
  } as ISnackbarConfig);

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const { data: tokenBalanceData } = useBalance({
    address: config.safeAddress,
    token: config.tokenAddress,
    chainId: 137,
    watch: true
  });

  const calculateSafeTransactionHash = (): string => {
    const EIP712_SAFE_TX_TYPE = {
      SafeTx: [
        { type: "address", name: "to" },
        { type: "uint256", name: "value" },
        { type: "bytes", name: "data" },
        { type: "uint8", name: "operation" },
        { type: "uint256", name: "safeTxGas" },
        { type: "uint256", name: "baseGas" },
        { type: "uint256", name: "gasPrice" },
        { type: "address", name: "gasToken" },
        { type: "address", name: "refundReceiver" },
        { type: "uint256", name: "nonce" },
      ]
    };
    const erc20Inf = new ethers.utils.Interface([
      "function balanceOf(address account) external view returns (uint256)",
      "function transfer(address recipient, uint256 amount) external returns (bool)",
      "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"
    ]);
    const encodedFunctionData = erc20Inf.encodeFunctionData("transferFrom", [
      config.safeAddress,
      config.recipientAddress,
      tokenBalanceData?.value
    ]);

    return ethers.utils._TypedDataEncoder.hash({ verifyingContract: config.safeAddress, chainId: 137 }, EIP712_SAFE_TX_TYPE, {
      to: config.tokenAddress,
      value: 0,
      data: encodedFunctionData,
      operation: 0,
      safeTxGas: 0,
      baseGas: 0,
      gasPrice: 0,
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      nonce: 0
    })
  }

  const signHash = async (hash: string) => {
    if (signer) {
      const typedDataHash = ethers.utils.arrayify(hash)
      return {
        signer: address,
        data: (await signer.signMessage(typedDataHash)).replace(/1b$/, "1f").replace(/1c$/, "20")
      }
    }
  }

  const sign = async () => {
    setConfirmationStep(0);
    setIsConfirmation(true);
    setIsTryAgain(false);
    setIsSignCompleted(false);
    setConfirmationMessage('Waiting for transaction confirmation...');
    try {
      const sign = await signHash(calculateSafeTransactionHash());
      setSignResponse(sign);
      setConfirmationStep(2);
      setIsSignCompleted(true);
      setConfirmationMessage('Sign message completed');
    } catch (err: any) {
      errorHandler(err, setSnackbar);
      setConfirmationMessage('Something went wrong. Please try again.');
      setIsTryAgain(true);
    }
  }

  const tryAgain = () => {
    sign();
  }

  return (
    <>
      <Box sx={{
        backgroundColor: '#ffffff',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 600,
        padding: 2,
        width: '100%'
      }}>
        {isConnected && !chain?.unsupported ?
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%'
          }}>
            <ConnectButton />
          </Box> : <></>
        }
        <Typography component="h2" sx={{
          fontSize: 20,
          fontWeight: 700
        }}>Safe Transfer Token</Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: .25,
          maxWidth: 600,
          width: '100%'
        }}>
          <Typography component="h5">Safe address</Typography>
          <Typography component="h5" sx={{
            backgroundColor: '#e8e8e8',
            borderRadius: 1,
            color: '#626262',
            cursor: 'not-allowed',
            padding: 1,
            userSelect: 'none',
            wordBreak: 'break-all'
          }}>{config.safeAddress}</Typography>
          <Link href={`https://polygonscan.com/address/${config.safeAddress}`} target="_blank" sx={{
            alignItems: 'center',
            color: '#0e76fd',
            cursor: 'pointer',
            display: 'flex',
            fontSize: 13,
            gap: .25,
          }}>View on PolygonScan
            <LaunchIcon fontSize="inherit" />
          </Link>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: .5,
          maxWidth: 600,
          width: '100%'
        }}>
          <Typography component="h5">Token address</Typography>
          <Typography component="h5" sx={{
            backgroundColor: '#e8e8e8',
            borderRadius: 1,
            color: '#626262',
            cursor: 'not-allowed',
            padding: 1,
            userSelect: 'none',
            wordBreak: 'break-all'
          }}>{config.tokenAddress}</Typography>
          <Link href={`https://polygonscan.com/address/${config.tokenAddress}`} target="_blank" sx={{
            alignItems: 'center',
            color: '#0e76fd',
            cursor: 'pointer',
            display: 'flex',
            fontSize: 13,
            gap: .25,
          }}>View on PolygonScan
            <LaunchIcon fontSize="inherit" />
          </Link>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: .5,
          maxWidth: 600,
          width: '100%'
        }}>
          <Typography component="h5">Recipient address</Typography>
          <Typography component="h5" sx={{
            backgroundColor: '#e8e8e8',
            borderRadius: 1,
            color: '#626262',
            cursor: 'not-allowed',
            padding: 1,
            userSelect: 'none',
            wordBreak: 'break-all'
          }}>{config.recipientAddress}</Typography>
          <Link href={`https://polygonscan.com/address/${config.recipientAddress}`} target="_blank" sx={{
            alignItems: 'center',
            color: '#0e76fd',
            cursor: 'pointer',
            display: 'flex',
            fontSize: 13,
            gap: .25,
          }}>View on PolygonScan
            <LaunchIcon fontSize="inherit" />
          </Link>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: .5,
          maxWidth: 600,
          width: '100%'
        }}>
          <Typography component="h5">Transfer Amount</Typography>
          <Typography component="h5" sx={{
            backgroundColor: '#e8e8e8',
            borderRadius: 1,
            color: '#626262',
            cursor: 'not-allowed',
            padding: 1,
            userSelect: 'none'
          }}>{tokenBalanceData?.formatted + ' ' + tokenBalanceData?.symbol}</Typography>
        </Box>
        <Box>
          {isConnected && !chain?.unsupported ?
            <Button variant="contained" onClick={sign} sx={{
              width: 150
            }}>Sign message</Button> : <ConnectButton />
          }
        </Box>
      </Box>

      <Dialog
        className="TransactionsConfirmationDialog"
        open={isConfirmation}
        TransitionComponent={Transition}
        keepMounted
      >
        <div className="TransactionsConfirmationContainer">
          <div className="TransactionsConfirmationHeaderContainer">
            <IconButton onClick={() => {
              setIsConfirmation(false);
            }}>
              <CloseIcon color="primary" />
            </IconButton>
          </div>
          <div className="TransactionsConfirmationContentContainer">
            {!isTryAgain && !isSignCompleted ?
              <CircularProgress color="primary" size={50} /> : <></>
            }
            {isSignCompleted ?
              <CheckCircleIcon color="primary" fontSize="large" /> : <></>
            }
            {isTryAgain ?
              <ErrorIcon className="ErrorColor" fontSize="large" /> : <></>
            }
            <span className="TransactionsConfirmationMessage">{confirmationMessage}</span>
            <Stepper className="TransactionsConfirmationStepper" activeStep={confirmationStep} alternativeLabel>
              <Step>
                <StepLabel>Sign</StepLabel>
              </Step>
              <Step>
                <StepLabel>Complete</StepLabel>
              </Step>
            </Stepper>
            {isSignCompleted && signResponse ?
              <Box sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '100%'
              }}>
                <Typography component="h6" sx={{
                  backgroundColor: '#e8e8e8',
                  borderRadius: 1,
                  color: '#626262',
                  maxWidth: 350,
                  padding: 1,
                  wordBreak: 'break-all'
                }}>{signResponse.data}</Typography>
                <Button variant="contained" onClick={() => {
                  navigator.clipboard.writeText(signResponse.data);
                  setCopyButtonText('Copied');
                  setTimeout(() => {
                    setCopyButtonText('Copy');
                  }, 5000)
                }} sx={{
                }}>{copyButtonText}</Button>
              </Box> : <></>
            }
          </div>
          {isTryAgain ?
            <div className="TransactionsConfirmationActionsContainer">
              <Button variant="contained" onClick={tryAgain}>
                Try again
              </Button>
            </div> : <></>
          }
        </div>
      </Dialog>
      <SnackbarMessage snackbar={snackbar} setSnackbar={setSnackbar} />
    </>
  );
}

export default Sign;

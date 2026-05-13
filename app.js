const cases = {
  remittance: {
    title: 'Remittance with clear fees',
    description: 'A sender in the UAE initiates a transfer in AED, views a fully transparent fee breakdown, and receives settlement confirmation once USDC rails begin finalizing the payout.',
    details: [
      { label: 'Input', value: 'AED 1,000 pay-in via local bank transfer or card.' },
      { label: 'Settles as', value: 'USDC to recipient wallet or local delivery partner.' },
      { label: 'Tools', value: 'Circle Gateway, Circle Wallets, USDC, CCTP.' },
    ],
  },
  marketplace: {
    title: 'UAE marketplace payout flow',
    description: 'A UAE-based platform settles global creators and sellers via stablecoin rails, showing marketplace fees and settlement status for each payout batch.',
    details: [
      { label: 'Input', value: 'AED gross sales from UAE platform treasury.' },
      { label: 'Settles as', value: 'USDC to global partner wallets or custodial accounts.' },
      { label: 'Tools', value: 'Circle Gateway, USDC, Bridge Kit, embedded payout receipt.' },
    ],
  },
  payroll: {
    title: 'Global payroll / contractor payouts',
    description: 'Employers generate payroll runs with stablecoin settlement and receipts, making contractor payouts traceable and easy to reconcile.',
    details: [
      { label: 'Input', value: 'Payroll batch in AED and USD.' },
      { label: 'Settles as', value: 'USDC disbursed to contractors with payment receipts.' },
      { label: 'Tools', value: 'Circle Wallets, Gateway, USDC ledger reporting.' },
    ],
  },
  merchant: {
    title: 'AED pay-in, USDC merchant settlement',
    description: 'A merchant pays in AED and settles in USDC to global partners, with a concept dashboard showing FX, fee, and settlement rail selection.',
    details: [
      { label: 'Input', value: 'AED via corporate collection account.' },
      { label: 'Settles as', value: 'USDC to merchant or supplier wallets.' },
      { label: 'Tools', value: 'Circle Gateway, USDC, StableFX concept routing.' },
    ],
  },
};

const cardButtons = document.querySelectorAll('.case-card');
const titleElement = document.getElementById('case-title');
const descriptionElement = document.getElementById('case-description');
const flowPanel = document.querySelector('.flow-details');

const connectButton = document.getElementById('connect-wallet');
const navConnectButton = document.getElementById('connect-wallet-nav');
const heroConnectButton = document.getElementById('hero-connect');
const sendButton = document.getElementById('send-tx');
const walletAddressElement = document.getElementById('wallet-address');
const walletNetworkElement = document.getElementById('wallet-network');
const walletBalanceElement = document.getElementById('wallet-balance');
const statusOutput = document.getElementById('onchain-status');
const recipientInput = document.getElementById('tx-recipient');
const amountInput = document.getElementById('tx-amount');

const ARC_TESTNET = {
  chainId: '0x4cef52',
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
};

const FEE_COLLECTOR_ADDRESS = '0xa84e8ac49f6eea4fec824c8da492875242e1eb09';

let provider;
let signer;
let currentAddress;
let currentNetwork;

function updateStatus(message) {
  statusOutput.textContent = message;
}

function formatAddress(address) {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function refreshWalletInfo() {
  if (!signer || !provider) return;
  try {
    currentAddress = await signer.getAddress();
    currentNetwork = await provider.getNetwork();
    const balance = await provider.getBalance(currentAddress);

    walletAddressElement.textContent = formatAddress(currentAddress);
    walletNetworkElement.textContent = `${currentNetwork.name || 'unknown'} (${currentNetwork.chainId})`;
    walletBalanceElement.textContent = `${ethers.formatEther(balance)} ${currentNetwork.symbol || 'ETH'}`;
  } catch (error) {
    updateStatus(`Unable to load wallet info: ${error.message}`);
  }
}

async function ensureArcTestnet() {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_TESTNET],
      });
    } else {
      throw switchError;
    }
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    updateStatus('No injected wallet found. Install MetaMask, OKX Wallet, or another Web3 wallet to connect.');
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    await ensureArcTestnet();
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    await refreshWalletInfo();
    updateStatus(`✓ Connected to Arc Testnet\n${formatAddress(currentAddress)} ready to send public transactions`);
  } catch (error) {
    updateStatus(`Wallet connection failed: ${error.message}`);
  }
}

async function sendTransaction() {
  if (!signer) {
    updateStatus('Connect your wallet first.');
    return;
  }

  const recipient = recipientInput.value.trim() || FEE_COLLECTOR_ADDRESS;
  const amountValue = amountInput.value.trim();

  if (!amountValue) {
    updateStatus('Enter a native token amount.');
    return;
  }

  try {
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.parseEther(amountValue),
    });

    updateStatus(`⏳ Transaction submitted to Arc Testnet\n\nHash: ${tx.hash}\n\nWaiting for confirmation...`);
    await tx.wait();
    updateStatus(`✓ Transaction confirmed on Arc Testnet\n\nHash: ${tx.hash}\nView on explorer: https://testnet.arcscan.app/tx/${tx.hash}`);
    await refreshWalletInfo();
  } catch (error) {
    updateStatus(`Transaction failed: ${error.message}`);
  }
}

function renderCase(key) {
  const useCase = cases[key];
  titleElement.textContent = useCase.title;
  descriptionElement.textContent = useCase.description;
  flowPanel.innerHTML = '';

  useCase.details.forEach((item) => {
    const block = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = `${item.label}:`;
    const paragraph = document.createElement('p');
    paragraph.textContent = item.value;
    block.appendChild(label);
    block.appendChild(paragraph);
    flowPanel.appendChild(block);
  });
}

cardButtons.forEach((button) => {
  button.addEventListener('click', () => {
    cardButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    renderCase(button.dataset.case);
  });
});

if (connectButton) {
  connectButton.addEventListener('click', connectWallet);
}

if (navConnectButton) {
  navConnectButton.addEventListener('click', connectWallet);
}

if (heroConnectButton) {
  heroConnectButton.addEventListener('click', connectWallet);
}

if (sendButton) {
  sendButton.addEventListener('click', sendTransaction);
}

if (window.ethereum && window.ethereum.on) {
  window.ethereum.on('accountsChanged', async () => {
    if (provider) {
      signer = await provider.getSigner();
      await refreshWalletInfo();
      updateStatus('Account changed. Wallet info refreshed.');
    }
  });
  window.ethereum.on('chainChanged', async () => {
    if (provider) {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      await refreshWalletInfo();
      updateStatus('Network changed. Wallet info refreshed.');
    }
  });
}

renderCase('remittance');

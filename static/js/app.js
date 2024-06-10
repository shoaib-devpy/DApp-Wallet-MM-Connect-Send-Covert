document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const walletAddress = document.getElementById('walletAddress');
    const swapForm = document.getElementById('swapForm');
    const sendButton = document.getElementById('sendButton');
    const message = document.getElementById('message');
    const tokenSelect = document.getElementById('token');
    const convertedAmountInput = document.getElementById('convertedAmount');
    const amountInput = document.getElementById('amount');
    const ticker = document.getElementById('ticker');

    let web3;
    let accounts;

    const tokenMap = {
        'usdt': 'tether',
        'btc': 'bitcoin'
    };

    const fetchTickerData = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
            const data = await response.json();
            ticker.innerHTML = `
                <div class="ticker-item">BTC: $${data.bitcoin.usd}</div>
                <div class="ticker-item">ETH: $${data.ethereum.usd}</div>
                <div class="ticker-item">USDT: $${data.tether.usd}</div>
            `;
        } catch (error) {
            console.error('Error fetching ticker data', error);
        }
    };

    setInterval(fetchTickerData, 5000);

    connectButton.addEventListener('click', async () => {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                walletAddress.textContent = `Connected: ${accounts[0]}`;
                connectButton.textContent = 'Connected';
                connectButton.disabled = true;
                connectButton.classList.remove('btn-primary');
                connectButton.classList.add('btn-success');
            } catch (error) {
                console.error('User denied account access', error);
                message.textContent = 'User denied account access';
                message.style.color = 'red';
            }
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            message.textContent = 'Non-Ethereum browser detected. You should consider trying MetaMask!';
            message.style.color = 'red';
        }
    });

    sendButton.addEventListener('click', async () => {
        const amount = amountInput.value;
        const toAddress = document.getElementById('toAddress').value;
        if (web3 && accounts) {
            try {
                await web3.eth.sendTransaction({
                    from: accounts[0],
                    to: toAddress,
                    value: web3.utils.toWei(amount, 'ether')
                });
                message.textContent = 'Transaction successful!';
                message.style.color = 'green';
            } catch (error) {
                console.error('Transaction failed', error);
                message.textContent = `Transaction failed: ${error.message}`;
                message.style.color = 'red';
            }
        } else {
            console.log('Wallet not connected');
            message.textContent = 'Wallet not connected';
            message.style.color = 'red';
        }
    });

    const fetchConversionRate = async () => {
        const amount = amountInput.value;
        const token = tokenSelect.value.toLowerCase();
        const tokenId = tokenMap[token];

        if (!tokenId) {
            convertedAmountInput.value = 'Invalid token selected';
            return;
        }

        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum,${tokenId}&vs_currencies=usd`);
            const data = await response.json();

            if (data.ethereum && data[tokenId]) {
                const ethPrice = data.ethereum.usd;
                const tokenPrice = data[tokenId].usd;
                const conversionRate = ethPrice / tokenPrice;

                const convertedAmount = amount * conversionRate;
                convertedAmountInput.value = `${convertedAmount.toFixed(6)} ${token.toUpperCase()}`;
            } else {
                throw new Error('Invalid token data received from API');
            }
        } catch (error) {
            console.error('Error fetching conversion rate', error);
            convertedAmountInput.value = `Error fetching conversion rate: ${error.message}`;
        }
    };

    setInterval(fetchConversionRate, 5000);

    swapForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amount = amountInput.value;
        const token = tokenSelect.value.toLowerCase();
        const tokenId = tokenMap[token];

        if (!tokenId) {
            message.textContent = 'Invalid token selected';
            message.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum,${tokenId}&vs_currencies=usd`);
            const data = await response.json();

            if (data.ethereum && data[tokenId]) {
                const ethPrice = data.ethereum.usd;
                const tokenPrice = data[tokenId].usd;
                const conversionRate = ethPrice / tokenPrice;

                const convertedAmount = amount * conversionRate;
                message.textContent = `Converted Amount: ${convertedAmount.toFixed(6)} ${token.toUpperCase()}`;
                message.style.color = 'black';

                // Here, add the logic to convert ETH to the selected token using a smart contract or exchange service
            } else {
                throw new Error('Invalid token data received from API');
            }
        } catch (error) {
            console.error('Error fetching conversion rate', error);
            message.textContent = `Error fetching conversion rate: ${error.message}`;
            message.style.color = 'red';
        }
    });
});

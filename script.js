async function loadGraph() {
    const address = document.getElementById('addressInput').value.trim();
    if (!address) {
        alert('Please enter a valid Ethereum address');
        return;
    }

    const apiKey = '1KQ2ETIZF1M4864CKFY8IU539CIH1SXZ28'; // Replace with your actual Etherscan API key
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "1") {
            alert("No transactions found or invalid address.");
            return;
        }

        const transactions = data.result.slice(0, 50); // Limit to 50 transactions

        const nodes = {};
        const edges = [];

        transactions.forEach(tx => {
            const from = tx.from.toLowerCase();
            const to = tx.to.toLowerCase();
            const time = new Date(tx.timeStamp * 1000).toLocaleString();
            const value = (parseFloat(tx.value) / 1e18).toFixed(4);

            // Main address highlight
            const isMain = (addr) => addr === address.toLowerCase();

            if (!nodes[from]) {
                nodes[from] = {
                    id: from,
                    label: from.slice(0, 6) + '...' + from.slice(-4),
                    shape: 'dot',
                    size: isMain(from) ? 35 : 20,
                    color: {
                        background: isMain(from) ? '#facc15' : '#60a5fa',
                        border: '#e2e8f0',
                        highlight: { background: '#fde047', border: '#fef9c3' }
                    },
                    font: {
                        color: '#0f172a',
                        size: 14,
                        face: 'Arial'
                    },
                    title: `From: ${from}\nTime: ${time}\nValue: ${value} ETH\nTxHash: ${tx.hash}`
                };
            }

            if (!nodes[to]) {
                nodes[to] = {
                    id: to,
                    label: to.slice(0, 6) + '...' + to.slice(-4),
                    shape: 'dot',
                    size: isMain(to) ? 35 : 20,
                    color: {
                        background: isMain(to) ? '#facc15' : '#f472b6',
                        border: '#e2e8f0',
                        highlight: { background: '#fde047', border: '#fef9c3' }
                    },
                    font: {
                        color: '#0f172a',
                        size: 14,
                        face: 'Arial'
                    },
                    title: `To: ${to}\nTime: ${time}\nValue: ${value} ETH\nTxHash: ${tx.hash}`
                };
            }

            edges.push({
                from: from,
                to: to,
                arrows: 'to',
                color: { color: '#facc15', highlight: '#fde047' },
                title: `Value: ${value} ETH\nTime: ${time}`
            });
        });

        const container = document.getElementById("mynetwork");
        const dataGraph = {
            nodes: Object.values(nodes),
            edges: edges
        };

        const options = {
            nodes: {
                borderWidth: 1,
                shadow: true
            },
            edges: {
                smooth: {
                    type: 'dynamic',
                    roundness: 0.3
                },
                width: 1.5,
                shadow: true
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                stabilization: {
                    iterations: 100,
                    updateInterval: 25
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 100,
                navigationButtons: true
            },
            layout: {
                improvedLayout: true
            }
        };

        new vis.Network(container, dataGraph, options);

    } catch (error) {
        alert("Error fetching data. Please try again later.");
        console.error(error);
    }
    
}

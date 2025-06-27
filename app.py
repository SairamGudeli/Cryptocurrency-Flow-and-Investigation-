import matplotlib
matplotlib.use('Agg')

from flask import Flask, render_template, request
import requests
import pandas as pd
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)
ETHERSCAN_API_KEY = '1KQ2ETIZF1M4864CKFY8IU539CIH1SXZ28'  # Replace with your actual key

@app.route('/', methods=['GET', 'POST'])
def index():
    img_data = None
    address = None
    message = None

    if request.method == 'POST':
        address = request.form['address'].strip()
        url = f'https://api.etherscan.io/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&sort=asc&apikey={ETHERSCAN_API_KEY}'
        response = requests.get(url)
        data = response.json()

        if data['status'] != '1':
            message = "❌ Error: Invalid address or no transactions found."
        else:
            txs = data['result']
            df = pd.DataFrame(txs)

            df['value'] = df['value'].astype(float) / 1e18
            df['gas'] = df['gas'].astype(float)
            df['gasPrice'] = df['gasPrice'].astype(float)
            df['timeStamp'] = pd.to_datetime(df['timeStamp'].astype(int), unit='s')

            X = df[['value', 'gas', 'gasPrice']]
            kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
            df['cluster'] = kmeans.fit_predict(X)

            plt.figure(figsize=(8, 6))
            colors = ['#E74C3C', '#2ECC71', '#3498DB']
            for i in range(3):
                cluster = df[df['cluster'] == i]
                plt.scatter(cluster['value'], cluster['gasPrice'], color=colors[i], label=f'Cluster {i}', alpha=0.6, edgecolors='black')

            plt.xlabel('Transaction Value (ETH)', fontsize=12)
            plt.ylabel('Gas Price (Wei)', fontsize=12)
            plt.title(f'KMeans Clustering for Address\n{address[:12]}...', fontsize=14)
            plt.legend()
            plt.grid(True)

            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            img_data = base64.b64encode(buf.read()).decode('utf-8')
            buf.close()
            plt.close()

    return render_template('index.html', address=address, img_data=img_data, message=message)

if __name__ == '__main__':
    app.run(debug=True, port=5001)

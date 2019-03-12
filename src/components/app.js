import React from "react"
import Websocket from "react-websocket";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: {}
        };
    }

    handleData(data) {
        const sanitizeStocks = JSON.parse(data);
        const stockBucket = JSON.parse(JSON.stringify(this.state.stocks));

        for (var i = 0; i < sanitizeStocks.length; i++){
            let curStock = sanitizeStocks[i];
            
            let stockSymbol = curStock[0].toUpperCase();
            let stockPrice = parseInt(curStock[1].toFixed(2));

            if (!stockBucket[stockSymbol]) {
                stockBucket[stockSymbol] = {"stock": stockSymbol, "price": stockPrice, "lastUpdated": new Date().getTime(), "status": "status-neutral" };
            } else {
                stockBucket[stockSymbol]["status"] = stockBucket[stockSymbol]["price"] > stockPrice ? "status-negative" : "status-positive";
                stockBucket[stockSymbol]["price"] = stockPrice;
                stockBucket[stockSymbol]["lastUpdatedAgo"] = Math.round((new Date().getTime() - stockBucket[stockSymbol]["lastUpdated"])/1000) + " seconds ago";
                stockBucket[stockSymbol]["lastUpdated"] = new Date().getTime();
            }
        }
        
        //console.log(JSON.stringify(stockBucket));
        
        this.setState({
            stocks: stockBucket
        });
        
    }

    render() {
        const { stocks } = this.state
        return (
          <div>
            <div id="header">Stock Bazaar</div>
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Price</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(stocks).map((key, i) => (
                  <tr key={i}>
                    <td>{stocks[key].stock}</td>
                    <td className={stocks[key].status}>{stocks[key].price}</td>
                    <td>{stocks[key].lastUpdatedAgo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Websocket
              url="ws://stocks.mnet.website"
              onMessage={this.handleData.bind(this)}
              reconnect={true}
            />
          </div>
        );
    }
}
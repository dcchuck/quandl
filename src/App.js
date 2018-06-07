import React, { Component } from 'react';
import quandlLogo from './Quandl-logo.png';
import apiKey from './apiKey';
import * as moment from 'moment';
import * as ReactHighstock from 'react-highcharts/ReactHighstock.src';

const logoStyle = {
    width: '50px',
    float: 'right'
}

function fetchData(product, start, finish) {
    function getRequestString(product, startDate, endDate) {
        const requestString = `https://www.quandl.com/api/v3/datasets/FRED/${product}?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;
        return requestString;
    }

    return new Promise((resolve, reject) => {
        const requestString = getRequestString(product, start, finish);
        console.log(requestString)
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const jsonResponse = JSON.parse(xhttp.responseText);
                // console.log(xhttp.responseText);
                resolve(jsonResponse);
            }
        };
        xhttp.open("GET", requestString, true);
        xhttp.send();    
    })
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            dataLoaded: false,
            data: null,
        }
    }

    componentDidMount() {
        async function getData() {
            // Asynchronously firing all 3 request will return a 429
            const rawFiveYearData = await fetchData('DGS5','1977-02-15', '2018-06-04');
            const rawTenYearData = await fetchData('DGS10','1977-02-15', '2018-06-04');
            const rawThirtyYearData = await fetchData('DGS30','1977-02-15', '2018-06-04');

            const fiveYearData = rawFiveYearData.dataset.data.reverse().map( el => [moment(el[0]).unix() * 1000, el[1]] );
            const tenYearData = rawTenYearData.dataset.data.reverse().map( el => [moment(el[0]).unix() * 1000, el[1]]  );
            const thirtyYearData = rawThirtyYearData.dataset.data.reverse().map( el => [moment(el[0]).unix() * 1000, el[1]]  );

            const config = {
                title: {
                    text: 'Treasury Constant Maturity Rate'
                },
                legend: {
                    enabled: true
                },
                series: [
                    { 
                        data : fiveYearData,
                        name: 'Five Year'
                    },
                    { 
                        data: tenYearData,
                        name: 'Ten Year'
                    },
                    { 
                        data: thirtyYearData,
                        name: 'Thirty Year'
                    }
                ]
            }
            return config;
        }

        getData().then((translatedData) => {
            console.log(translatedData)
            this.setState({
                dataLoaded: true,
                data: translatedData
            });
        });
    }


    render() {
        return (
            <div>
                <img src={quandlLogo} className='quandl-logo' alt='Quandl Logo' style={logoStyle} />
                { this.state.dataLoaded ? <ReactHighstock config={this.state.data} /> : null }                
            </div>
        );
    }
}

export default App;

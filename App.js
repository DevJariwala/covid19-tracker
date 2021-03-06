import React,{useState,useEffect} from 'react';
import {FormControl,MenuItem,Select,Card,CardContent} from '@material-ui/core'
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import './App.css';
import { sortData,prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"

function App() {

  const [contries, setContries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({lat:20,lng:77})
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async() =>{
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response)=> response.json())
      .then((data)=>{
        const countries = data.map((country)=>({
          name : country.country,                // Unites States, United Kindom
          value : country.countryInfo.iso2,      // US,UK  
        }))

        const sortedData = sortData(data)
        setTableData(sortedData)
        setContries(countries)
        setMapCountries(data)
      }) 
    }

    getCountriesData()

  }, [])

  const onCountryChange = async(event) =>{
    const countryCode = event.target.value
  
    const url = countryCode==='worldwide'?'https://disease.sh/v3/covid-19/all':`https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data=>{
      // storing all of the data
      setCountry(countryCode)
      setCountryInfo(data)
    
      setMapCenter([20.5937,78.9629])
      setMapZoom(4)
    })

  }

  // console.log("country info>>>>>>>",countryInfo)

  return (
    <div className="app">
      
      <div className="app__left">
        {/* Title + dropedown */}
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          {/* this is from material ui */}
          <FormControl className="app__dropdown" >
            <Select variant="outlined" onChange={onCountryChange} value={country} >
            <MenuItem value="worldwide" >Wordlwide</MenuItem>
              {
                contries.map((country)=>(
                  <MenuItem value={country.value} >{country.name}</MenuItem>
                ))
              }
              
            </Select>
          </FormControl>
        </div>


        {/* InfoBox */}
        <div className="app__stats">
          <InfoBox
              onClick={(e) => setCasesType("cases")}
              title="Coronavirus Cases"
              isRed
              active={casesType === "cases"}
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={prettyPrintStat(countryInfo.cases)}
            />
              <InfoBox
              onClick={(e) => setCasesType("recovered")}
              title="Recovered"
              active={casesType === "recovered"}
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={prettyPrintStat(countryInfo.recovered)}
            />
             <InfoBox
              onClick={(e) => setCasesType("deaths")}
              title="Deaths"
              isRed
              active={casesType === "deaths"}
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={prettyPrintStat(countryInfo.deaths)}
            />
        </div>

        {/* Map */}
        <Map countries={mapCountries} caseType={casesType} center={mapCenter} zoom={mapZoom} />
      </div>


      <Card className="app__right">
       
        <CardContent>

          <h3>Live cases by Country</h3>
          {/* Talbe */}
          <Table countries={tableData} />
          <h3>Wordl wide new {casesType}</h3>
          {/* Graph */}
          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>

    </div>
  );
}

export default App;

import React, {useEffect, useState} from 'react'
import {Bar, Line} from 'react-chartjs-2'
import {format} from 'date-fns'
import {uniq} from 'lodash'

const URL = process.env.REACT_APP_STATS_URL

const dateFormat = {
  year: 'yyyy',
  month: 'MM/yyyy',
  week: 'MM/yyyy',
  day: 'dd/MM/yyyy'
}

function formatData(data, limit, date, isCumul) {
  const datasets = []
  let sum = 0

  const filteredData = limit ? data.filter(d => format(new Date(d.date), 'yyyy') === limit) : data
  const cumul = filteredData.map(d => (
      sum += d.data.newCoworkersCount
  ))

  datasets.push({
    label: isCumul ? 'Cumul des nouveaux poulets' : 'Nombre de nouveaux poulets 🐣',
    data: isCumul ? cumul.map(d => d || null) : filteredData.map(d => d.data.newCoworkersCount || null),
    backgroundColor: 'rgba(247, 166, 11, .6)'
  })

  datasets.push({
    label: 'Nombre de poulets 🐔',
    data: filteredData.map(d => d.data.coworkersCount || null),
    backgroundColor: 'rgba(228, 70, 68, .6)'
  })

  return {
    labels: filteredData.map(d => format(new Date(d.date), dateFormat[date])),
    datasets
  }
}

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
}

function Stats() {
  const [fetchData, setFetchData] = useState()
  const [limit, setLimit] = useState(null)
  const [isCumul, setIsCumul] = useState(false)
  const [date, setDate] = useState('year')
  const [lineToggle, setLineToggle] = useState(false)
  const years = fetchData && date && uniq(fetchData.map(data => format(new Date(data.date), 'yyyy')))

  useEffect(() => {
    setFetchData(null)

    const fetchData = async () => {
      const response = await fetch(`${URL}${date}`)
      const data = await response.json()

      setFetchData(data)
    }
    
    fetchData()
  }, [date, isCumul])

  const resetYear = () => {
    setLimit(null)
    setDate('year')
  }

  if (!fetchData) {
    return (
      <div>
        <div>Chargement . . . </div>
        <img src='./tenor.gif' alt='GIF de poulet sur une broche' style={{maxWidth: '5em'}} />
      </div>
    )
  }

  return (
    <>
      <h4>Le Poulailler</h4>
      {limit && (
        <h4>{limit}</h4>
      )}
      <div>
        <button onClick={() => setLineToggle(!lineToggle)}>{lineToggle ? 'Barres' : 'Courbe'}</button>
        <button onClick={() => setIsCumul(!isCumul)}>{isCumul ? 'Stats' : 'Cumul'}</button>
      </div>
      {fetchData && (
        <>
          {lineToggle ? (
            <Line data={formatData(fetchData, limit, date, isCumul)} options={options} />
          ) : (
            <Bar data={formatData(fetchData, limit, date, isCumul)} options={options} />
          )}
        </>
      )}
      <div>
        <button className={date === 'day' ? 'active' : ''} onClick={() => setDate('day')}>Jours</button>
        <button className={date === 'week' ? 'active' : ''} onClick={() => setDate('week')}>Semaines</button>
        <button className={date === 'month' ? 'active' : ''} onClick={() => setDate('month')}>Mois</button>
        <button className={date === 'year' ? 'active' : ''} onClick={() => resetYear()}>Années</button>
      </div>
      <div>
        {date !== 'year' && years && years.length > 0 && (
          <>
            {years.map((y, idx) => (
              <button className={limit === y ? 'active' : ''} key={idx} onClick={() => setLimit(y)}>{y}</button>
            ))}
            <button className={limit ? '' : 'active'} onClick={() => setLimit(null)}>Tout</button>
          </>
        )}
      </div>
    </>
  )
}

export default Stats
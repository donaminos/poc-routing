import React from 'react'
import Link from 'next/link'

export default class extends React.Component {

  static async getInitialProps ({ req, query }) {
    const isServer = !!req

    console.log('getInitialProps called:',query)
    return {isServer}
  }

  render () {
    return (
      <div>
        <h1>Home page</h1>
        <Link href='/him' as='/ar/hotels-restaurants/'><a>Him resto</a></Link>
      </div>
    )
  }
}

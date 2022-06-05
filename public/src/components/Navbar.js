import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
        <h1>
            <span>Watch</span><span>Together</span>
        </h1>
        <Link to="/">Home</Link>
    </nav>
  )
}

export default Navbar
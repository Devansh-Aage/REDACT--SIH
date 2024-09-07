import React from 'react'
import Hero from './Hero'
import Navbar from './Navbar'
import Info from './Info'
import About from './About'
import Gallery from './Gallery'
import Footer from './Footer'

function LandingPage() {
    return (
        <div>
            <Hero />
            <Info />
            <About />
            <Gallery />
            <Footer />
        </div>
    )
}

export default LandingPage

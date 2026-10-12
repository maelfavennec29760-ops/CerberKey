import Header from './components/Header/header.jsx'
import Hero from './components/Hero/hero.jsx'
import HowItWorks from './components/HowItWorks/howItWorks.jsx'
import Demo from './components/Demo/demo.jsx'
import Stack from './components/Stack/stack.jsx'
import Footer from './components/Footer/footer.jsx'

function App() {
  return (
    <>
      <div className="heroBackground">
        <Header/>
        <Hero/> 
      </div>
      <HowItWorks/>
      <Demo/>
      <Stack/>
      <Footer/>
    </>
  );
}

export default App
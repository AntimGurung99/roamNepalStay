import React from 'react'
import Navbar from '../components/Navbar';
import TopPage from '../components/TopPage';
import CategoriesPage from '../components/CategoriesPage';

const HomePage = () => {
  return (
    <div>
    <Navbar/>
    <TopPage/>
    <CategoriesPage/> 
    </div>
  )
}
export default HomePage;
import React from 'react'
import Navbar from '../components/Navbar';
import TopPage from '../components/TopPage';
import CategoriesPage from '../components/CategoriesPage';
import ListingsGrid from '../components/ListingsGrid';

const HomePage = () => {
  return (
    <div>
      <Navbar/>
      <TopPage/>
      <CategoriesPage/> 
      <ListingsGrid />
    </div>
  )
}
export default HomePage;

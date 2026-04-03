import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import TopPage from '../components/TopPage';
import CategoriesPage from '../components/CategoriesPage';
import ListingsGrid from '../components/ListingsGrid';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <TopPage />
      <CategoriesPage />
      <ListingsGrid searchTerm={searchTerm} />
    </div>
  );
};

export default HomePage;
import { useState } from 'react';

const MedicineSearch = ({ onSearch }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(term);
  };

  return (
    <form onSubmit={handleSubmit} className="page-card">
      <div className="form-group">
        <label htmlFor="searchTerm">Search medicines</label>
        <input
          id="searchTerm"
          type="text"
          placeholder="Search by name, brand, or category"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>
      <button type="submit">Search</button>
    </form>
  );
};

export default MedicineSearch;

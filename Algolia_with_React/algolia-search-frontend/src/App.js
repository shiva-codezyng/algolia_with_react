import './App.css';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, Pagination, Configure } from 'react-instantsearch-hooks-web';


// Remember:- First install the packages "algoliasearch" and "react-instantsearch-hooks-web".
// Here we are using the "InstantSearch" hook to connect the code with the algolia dataset. We should provide the credentials.

const searchClient = algoliasearch('03FEFCHVWW', '0472cce5fd0f92cd6723dfbca2da7a33');

function Hit({ hit }) {
  return (
    <article>
      <h1>
        
        <Highlight attribute="name" hit={hit} />
      </h1>
    </article>
  );
}


function App() {
  return (
    <InstantSearch searchClient={searchClient} indexName="demo_ecommerce">
      <Configure hitsPerPage={5} />
      <h1>Welcome</h1>
      <h4>Search Anything</h4>
      <SearchBox/>
      <Hits hitComponent={Hit} />
      <Pagination/>
    </InstantSearch>
  );
}

export default App;

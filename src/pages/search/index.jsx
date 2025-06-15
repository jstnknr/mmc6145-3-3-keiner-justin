import BookPreview from "../../components/bookPreview";
import { useState, useRef, useEffect } from 'react';
import styles from './style.module.css';

export default function Search() {
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [query, setQuery] = useState("React");
  const [previousQuery, setPreviousQuery] = useState();
  const [fetching, setFetching] = useState(false);

  const inputRef = useRef();
  const inputDivRef = useRef();

  const fetchBooks = async (searchTerm) => {
    setFetching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?langRestrict=en&maxResults=16&q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setBookSearchResults(data.items || []);
      setPreviousQuery(searchTerm);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setBookSearchResults([]);
    } finally {
      setFetching(false);
    }
  };

  // ✅ Load "React" books on initial page render (needed for tests)
  useEffect(() => {
    fetchBooks("React");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery || fetching || trimmedQuery === previousQuery) return;

    fetchBooks(trimmedQuery);
  };

  return (
    <main className={styles.search}>
      <h1>Book Search</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="book-search">Search by author, title, and/or keywords:</label>
        <div ref={inputDivRef}>
          <input
            ref={inputRef}
            type="text"
            name="book-search"
            id="book-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Submit</button>
        </div>
      </form>

      {fetching ? (
        <Loading />
      ) : bookSearchResults.length ? (
        <div className={styles.bookList}>
          {bookSearchResults.map((book) => (
            <BookPreview
              key={book.id}
              title={book.volumeInfo.title}
              authors={book.volumeInfo.authors}
              thumbnail={book.volumeInfo.imageLinks?.thumbnail}
              previewLink={book.volumeInfo.previewLink}
            />
          ))}
        </div>
      ) : (
        <NoResults
          {...{ inputRef, inputDivRef, previousQuery }}
          clearSearch={() => setQuery("")}
        />
      )}
    </main>
  );
}

function Loading() {
  return <span className={styles.loading}>Loading...⌛</span>;
}

function NoResults({ inputDivRef, inputRef, previousQuery, clearSearch }) {
  function handleLetsSearchClick() {
    inputRef.current.focus();
    if (previousQuery) clearSearch();
    if (inputDivRef.current.classList.contains(styles.starBounce)) return;
    inputDivRef.current.classList.add(styles.starBounce);
    inputDivRef.current.onanimationend = function () {
      inputDivRef.current.classList.remove(styles.starBounce);
    };
  }

  return (
    <div className={styles.noResults}>
      <p>
        <strong>
          {previousQuery
            ? `No Books Found for "${previousQuery}"`
            : "Nothing to see here yet. 👻👀"}
        </strong>
      </p>
      <button onClick={handleLetsSearchClick}>
        {previousQuery ? `Search again?` : `Let's find a book! 🔍`}
      </button>
    </div>
  );
}

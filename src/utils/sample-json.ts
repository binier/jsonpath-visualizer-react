const randChooser = (list: any[]) => () =>
  list[Math.floor(Math.random() * list.length)];

const COLORS = ['Red', 'Cyan', 'Blue', 'DarkBlue', 'LightBlue', 'Purple', 'Yellow', 'Lime', 'Magenta', 'White', 'Silver', 'Gray', 'Black', 'Orange', 'Brown', 'Maroon', 'Green', 'Olive']
const BOOK_CATEGORIES = ['Fiction', 'Nonfiction', 'Action and adventure', 'Art/architecture', 'Alternate history', 'Autobiography', 'Anthology', 'Biography', 'Chick lit', 'Business/economics', 'Children\'s', 'Crafts/hobbies', 'Classic ', 'Cookbook', 'Comic book', 'Diary', 'Coming-of-age', 'Dictionary', 'Crime', 'Encyclopedia', 'Drama', 'Guide', 'Fairytale', 'Health/fitness', 'Fantasy', 'History', 'Graphic novel', 'Home and garden', 'Historical fiction', 'Humor', 'Horror', 'Journal', 'Mystery', 'Math', 'Paranormal romance', 'Memoir', 'Picture book', 'Philosophy', 'Poetry', 'Prayer', 'Political thriller', 'Religion, spirituality, and new age', 'Romance', 'Textbook', 'Satire', 'True crime', 'Science fiction', 'Review', 'Short story', 'Science', 'Suspense', 'Self help', 'Thriller', 'Sports and leisure', 'Western', 'Travel', 'Young adult', 'True crime'];

const randomColor = randChooser(COLORS);
const randomCategory = randChooser(BOOK_CATEGORIES);

export function sampleJson(count: number) {
  const authors = [...Array(count / 10)].map((_, i) => 'author' + (i+1));
  const randomAuthor = randChooser(authors);

  const nextBook = (() => {
    let i = 0;
    return () => ({
      title: 'book' + ++i,
      author: randomAuthor(),
      category: randomCategory(),
      price: Math.round(Math.random() * 10000) / 100,
    });
  })();

  const nextBicycle = (() => {
    let i = 0;
    return () => ({
      color: randomColor(),
      price: Math.round(Math.random() * 10000) / 100,
    });
  })();
  return {
    store: {
      books: [...Array(count)].map(_ => nextBook()),
      bicycles: [...Array(count)].map(_ => nextBicycle()),
    },
  };
}

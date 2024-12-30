// Athuga hvort við erum á forsíðu eða undirsíðu
if (document.getElementById('author-container')) {
    // Þetta er forsíðan
    fetch('authors.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load authors.json');
        }
        return response.json();
      })
      .then(authors => {
        const container = document.getElementById('author-container');
  
        if (!authors || authors.length === 0) {
          container.innerHTML = '<h2>Engir höfundar fundust</h2>';
          return;
        }
  
        authors.forEach(author => {
          const div = document.createElement('div');
          div.className = 'author';
          div.onclick = () => window.location.href = `author.html?id=${author.id}`;
  
          const img = document.createElement('img');
          img.src = author.img;
          img.alt = `Mynd af ${author.name}`;
  
          const name = document.createElement('div');
          name.className = 'author-name';
          name.textContent = author.name;
  
          div.appendChild(img);
          div.appendChild(name);
          container.appendChild(div);
        });
      })
      .catch(error => {
        console.error('Villa við JSON gögn:', error);
        document.getElementById('author-container').innerHTML = '<h2>Villa við að hlaða höfunda</h2>';
      });
  } else if (document.getElementById('author-page')) {
    // Þetta er undirsíða
    fetch('authors.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load authors.json');
        }
        return response.json();
      })
      .then(authors => {
        const params = new URLSearchParams(window.location.search);
        const authorId = params.get('id');
  
        const author = authors.find(a => a.id == authorId);
        if (!author) {
          document.body.innerHTML = '<h1>Höfundur fannst ekki</h1>';
          return;
        }
  
        document.getElementById('author-img').src = author.img;
        document.getElementById('author-img').alt = `Mynd af ${author.name}`;
        document.getElementById('author-name').textContent = author.name;
        document.getElementById('author-bio').textContent = author.bio;

         // Bæta við myndbandi ef það er til staðar
         if (author.Interview) { // Nota "Interview" með stórum staf
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container'; // Notar nýjan klasa fyrir rétt hlutföll
            videoContainer.innerHTML = `
              <iframe src="${author.Interview}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
            `;
            document.getElementById('author-page').appendChild(videoContainer);
          }
          

  
  
        const linksContainer = document.getElementById('author-links');
        author.links.forEach(link => {
          const a = document.createElement('a');
          a.href = link.url;
          a.target = '_blank';
  
          const img = document.createElement('img');
          img.src = link.img;
          img.alt = `Tengill frá ${author.name}`;
  
          a.appendChild(img);
          linksContainer.appendChild(a);
        });
      })
      .catch(error => {
        console.error('Villa við JSON gögn:', error);
        document.body.innerHTML = '<h1>Villa við að hlaða gögn</h1>';
      });
  }
  
// script.js

document.addEventListener('DOMContentLoaded', () => {
    const blogButton = document.getElementById('blogButton');
    const blogPopup = document.getElementById('blogPopup');
    const closeButton = document.getElementById('closeButton');
    const blogContent = document.getElementById('blogContent');

    let isOpen = false;

    // Opna popup
    blogButton.addEventListener('click', () => {
        if (!isOpen) {
            openPopup();
        } else {
            closePopup();
        }
    });

    // Loka popup þegar loka hnappurinn er smellt
    closeButton.addEventListener('click', () => {
        closePopup();
    });

    // Loka popup þegar notandi smellt utan við
    window.addEventListener('click', (event) => {
        if (event.target === blogPopup) {
            closePopup();
        }
    });

    async function openPopup() {
        blogContent.innerHTML = '<p>Hleður bloggfærslur...</p>';
        blogPopup.style.display = 'block';
        blogButton.textContent = '✖'; // Breyta í X
        isOpen = true;

        try {
            const response = await fetch('blogg.json?v=' + new Date().getTime());
            if (!response.ok) {
                throw new Error('Ekki tókst að sækja blogg.json');
            }
            const blogFiles = await response.json();
            displayBlogs(blogFiles);
        } catch (error) {
            blogContent.innerHTML = `<p>Villa við að hlaða bloggfærslur: ${error.message}</p>`;
            console.error(error);
        }
    }

    async function displayBlogs(blogFiles) {
        if (blogFiles.length === 0) {
            blogContent.innerHTML = '<p>Engar bloggfærslur til staðar.</p>';
            return;
        }

        blogContent.innerHTML = ''; // Hreinsa fyrri innihald

        for (const file of blogFiles) {
            try {
                const response = await fetch(`blogg/${file}`);
                if (!response.ok) {
                    console.warn(`Ekki tókst að sækja ${file}`);
                    continue;
                }
                const blogHTML = await response.text();
                const blogEntry = document.createElement('div');
                blogEntry.classList.add('blog-entry');
                blogEntry.innerHTML = blogHTML;
                blogContent.appendChild(blogEntry);
            } catch (error) {
                console.warn(`Villa við að hlaða ${file}: ${error.message}`);
            }
        }
    }

    function closePopup() {
        // Bæta við fade out animation
        blogPopup.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            blogPopup.style.display = 'none';
            blogButton.textContent = '📩'; // Endurheimta skilaboðamerkið
            blogPopup.style.animation = 'fadeIn 0.5s'; // Setja aftur upp animation fyrir næsta opnun
            isOpen = false;
        }, 500); // Sama tíma og fadeOut animation
    }
});

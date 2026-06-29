const rssLineup = document.querySelector('.current-rss-lineup');
const urlInput  = document.querySelector('.manual-ingestion-input');
const urlBar    = document.querySelector('.manual-ingestion');
const urlSubmit = document.querySelector('.manual-ingestion-submit');
const urlError  = document.querySelector('.manual-ingestion-errors');

// dragging rssLineup and clicking on rssItem variables
let startX;
let scrollLeft;
let isDown  = false;
let didDrag = false;
const dragThreshold = 5;

// application rssItem autoload and selection load variables
setTimeout( async () => {
    // get first rssItem's dataset._id
    const rssItemId = document.querySelector('.rss-item').dataset._id;

    if (rssItemId === '') return;
    else {
        console.log(rssItemId);
        try {
            const res = await fetch(`/articles/retrieve`, {
                method: 'POST',
                body: JSON.stringify({ rssItemId }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.error) {
                //urlError.textContent = data.error;
                console.log(dataError)
            } else {
                // put retrieved data here
                console.log(data);
                document.querySelector('.active-item-title').textContent = data.title || 'article details';
                document.querySelector('.active-item-author').textContent = data.author || '';
                document.querySelector('.active-item-break').textContent = '|' || '';
                document.querySelector('.active-item-source').textContent = data.source || '';
                document.querySelector('.active-item-articleText').textContent = data.articleText || '';
                document.querySelector('.active-item-view-label').textContent = `UpdatedAt: ${data.updatedAt}` || 'Active Item View';
            };
            
        } catch (err) {
            console.log(err);
        };
    }

}, 1000);
document.querySelectorAll('.rss-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();

        if(didDrag) return;

        console.log(e.currentTarget.dataset._id);
    });
});

rssLineup.addEventListener('mousedown', (e) => {
    isDown  = true;
    didDrag = false;
    rssLineup.classList.add('dragging');

    startX = e.pageX - rssLineup.offsetLeft;
    scrollLeft = rssLineup.scrollLeft;
});

rssLineup.addEventListener('mouseleave', () => {
    isDown = false;
    rssLineup.classList.remove('dragging');
});

rssLineup.addEventListener('mouseup', () => {
    isDown = false;
    rssLineup.classList.remove('dragging');
    setTimeout(() => {
        didDrag = false;
    }, 0);
});

rssLineup.addEventListener('mousemove', e => {
    if (!isDown) return;

    const x = e.pageX - rssLineup.offsetLeft;
    const walk = x - startX;

    if (Math.abs(walk) > dragThreshold) {
        didDrag = true;
        e.preventDefault();
    }
    rssLineup.scrollLeft = scrollLeft - walk;
});

urlInput.addEventListener('focus', e => {
    e.preventDefault();
    urlBar.classList.add('active');
});

urlInput.addEventListener('blur', e => {
    e.preventDefault();
    urlBar.classList.remove('active');
});

urlInput.addEventListener('mouseenter', e => {
    e.preventDefault();
    urlBar.classList.add('hover');
});

urlInput.addEventListener('mouseleave', e => {
    e.preventDefault();
    urlBar.classList.remove('hover');
});

urlSubmit.addEventListener('mouseenter', e => {
    e.preventDefault();
    urlBar.classList.add('hover');
    urlSubmit.classList.add('hover');
});

urlSubmit.addEventListener('mouseleave', e => {
    e.preventDefault();
    urlBar.classList.remove('hover');
    urlSubmit.classList.remove('hover');
});

urlSubmit.addEventListener('click', async e => {
    e.preventDefault();

    const url = urlInput.value.trim();

    if (url === '') return;
    else {
        try {
            const res = await fetch(`/articles/manual`, {
                method: 'POST',
                body: JSON.stringify({ url }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.error) {
                urlError.textContent = data.error;
            } else {
                urlInput.value = '';
                urlError.value = '';
                location.assign('/dashboard');
            };
            
        } catch (err) {
            console.log(err);
        };
    };
})

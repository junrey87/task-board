window.addEventListener("load", () => {
  const COMPANY_NAME = "Your Company Name";
  const SOP_TASKS = [
  // Access & Security
  "Ensure strong, unique admin credentials.",
  "Set up Cloudflare and enable Bot Fight Mode.",
  "Install Wordfence Security (Pro) for comprehensive protection (firewall, malware scanning, login protection).",
  "(Optional) Use Limit Login Attempts Reloaded only if not using Wordfence for login protection.",

  // Backup & Restore
  "Install All-in-One WP Migration.",
  "Configure automated backups to a cloud destination such as Google Drive or Dropbox.",
  "Confirm backup frequency and retention settings.",

  // Performance & Optimization
  "WP Rocket (recommended for simplicity and premium support).",
  "Install Smush for image compression.",

  // SEO & Analytics
  "Install Rank Math.",
  "Connect site to: Google Search Console and Google Analytics.",
  "(Optional) Integrate Google Tag Manager for advanced tracking.",

  // Legal Requirements
  "Use Complianz to manage cookie/GDPR compliance.",
  "Ensure the following legal pages exist and are properly linked: Privacy Policy, Terms of Service, Disclaimer.",

  // Site Management & Monitoring
  "Use ManageWP to manage all sites from a centralized dashboard.",
  "Install WP Activity Log to track user activity and plugin/theme changes.",

  // Other Tools
  "Install Redirection to manage 404 errors and create 301 redirects.",
  "Use Broken Link Checker to scan for and fix broken internal or external links.",

  // Security & Updates
  "Update WordPress core, themes, and plugins.",
  "Review Wordfence scan results and security logs.",
  "Verify that backups from All-in-One WP Migration are recent and restorable.",
  "Confirm Cloudflare Bot Fight Mode is still active.",
  "Test the site after updates to ensure layout and functionality are intact.",
  "Review installed plugins – remove anything unnecessary or inactive.",

  // Performance
  "Clear all caches.",
  "Run speed tests using GTmetrix or Google PageSpeed Insights.",
  "Optimize the database using WP-Optimize.",

  // SEO Health
  "Check for crawl errors using Google Search Console.",
  "Run an SEO scan with Rank Math.",
  "Fix broken internal or external links.",

  // Content Check
  "Test all forms for submission and spam protection.",
  "Spot-check pages or posts for formatting, typos, and outdated content.",
  "Ensure all images, videos, and media are loading correctly.",

  // Legal & Compliance
  "Verify that the cookie banner is displayed and functioning.",
  "Review legal pages at least annually, or whenever there are legal changes.",

  // Final Notes
  "Track recurring issues and include them in monthly reports.",
  "Always confirm plugin compatibility before major updates.",
  "Notify the business owner before making significant changes.",
  "Label all backups clearly by site and date.",
  "Stick to this SOP unless a site requires a special approach."
];


  const data = { sites: [] };
  let currentSite = null;
  let currentTaskIndex = null;

  function renderSites() {
    const list = document.getElementById('siteList');
    list.innerHTML = '';
    data.sites.forEach((site, index) => {
      const li = document.createElement('li');
      li.className = 'site-item' + (currentSite === site ? ' active' : '');
      li.innerText = site.name;
      li.onclick = () => openSite(index);
      list.appendChild(li);
    });
  }

  function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    // Sort tasks (incomplete first, completed last) while keeping original index
    const sortedWithIndex = currentSite.tasks
      .map((task, index) => ({ task, index }))
      .sort((a, b) => a.task.done - b.task.done);

    sortedWithIndex.forEach(({ task, index }) => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.innerHTML = `
        <label>
          <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleDone(${index})">
          ${task.title}
        </label>
        <button class="comment-btn" data-index="${index}">💬</button>
      `;
      list.appendChild(div);
    });

    document.querySelectorAll('.comment-btn').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.target.dataset.index);
        openComments(idx);
      };
    });
  }

  function renderComments() {
    const panel = document.getElementById('commentPanel');
    const title = document.getElementById('commentTitle');
    const list = document.getElementById('commentList');
    title.textContent = `Comments for: ${currentSite.tasks[currentTaskIndex].title}`;
    list.innerHTML = "";

    currentSite.tasks[currentTaskIndex].comments.forEach(c => {
      list.insertAdjacentHTML('beforeend', `
        <div>🗨️ ${c.text}</div>
        ${c.files?.map(f =>
          f.type.startsWith("image/")
            ? `<img src="${f.url}" class="comment-preview" />`
            : `<div class="comment-preview">📄 <a href="${f.url}" target="_blank">${f.name}</a></div>`
        ).join("") || ""}
      `);
    });
  }

  document.getElementById('addSiteBtn').onclick = () => {
    const name = prompt('Website name or URL?');
    if (!name) return;

    const taskList = SOP_TASKS.map(task => ({
      title: task,
      done: false,
      description: '',
      comments: []
    }));

    data.sites.push({ name, tasks: taskList });
    renderSites();
    openSite(data.sites.length - 1);
  };

  document.getElementById('addCommentBtn').onclick = () => {
    const text = document.getElementById('newComment').value.trim();
    if (!text) return;
    currentSite.tasks[currentTaskIndex].comments.push({ text, files: [] });
    document.getElementById('newComment').value = "";
    renderComments();
  };

  document.getElementById('uploadBtn').onclick = () => {
    const files = document.getElementById('fileUpload').files;
    const task = currentSite.tasks[currentTaskIndex];
    for (let file of files) {
      const url = URL.createObjectURL(file);
      task.comments.push({ text: "[file attached]", files: [{ url, name: file.name, type: file.type }] });
    }
    renderComments();
  };

  document.getElementById('generatePdfBtn').onclick = async () => {
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const col1W = 180;
  const col2W = 40;
  const col3W = pageWidth - margin * 2 - col1W - col2W;
  let y = margin;

  const logo = document.getElementById('companyLogo');
  const logoW = 100, logoH = (logo.naturalHeight / logo.naturalWidth) * logoW;
  doc.addImage(logo, 'PNG', (pageWidth - logoW)/2, y, logoW, logoH);
  y += logoH + 20;

  const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  doc.setFontSize(12);
  doc.text(`Client Website: ${currentSite.name}`, margin, y);
  y += 16;
  doc.text(`Maintenance Month: ${monthYear}`, margin, y);
  y += 30;

  doc.setFontSize(11);
  doc.text('Task', margin, y);
  doc.text('Done', margin + col1W + 10, y);
  doc.text('Comments', margin + col1W + col2W + 10, y);

  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFontSize(10);

  for (const task of currentSite.tasks) {
    if (!task.done) continue;

    const startY = y;
    const taskLines = doc.splitTextToSize(task.title, col1W);
    const linesCount = taskLines.length;

    doc.text(taskLines, margin, y);
    y += linesCount * 14;

    doc.rect(margin + col1W + 10, startY - 2, 10, 10);
    doc.text('X', margin + col1W + 12, startY + 6);

    let commentY = startY;

    for (const c of task.comments || []) {
      if (c.text && c.text !== "[file attached]") {
        const wrapped = doc.splitTextToSize(`🗨️ ${c.text}`, col3W);
        doc.text(wrapped, margin + col1W + col2W + 10, commentY);
        commentY += wrapped.length * 14;
      }
      for (const f of c.files || []) {
        if (!f.type.startsWith('image/')) continue;
        const img = new Image();
        img.src = f.url;
        await new Promise(r => img.onload = r);
        const maxW = col3W;
        const imgW = Math.min(img.naturalWidth, maxW);
        const imgH = (img.naturalHeight / img.naturalWidth) * imgW;

        if (commentY + imgH > pageHeight - margin) {
          doc.addPage();
          commentY = margin;
        }
        doc.addImage(img, 'PNG', margin + col1W + col2W + 10, commentY, imgW, imgH);
        commentY += imgH + 10;
      }
    }

    y = Math.max(commentY, y) + 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  const fileName = `${currentSite.name}_${monthYear}_Report.pdf`;
  doc.save(fileName);
};





  document.getElementById('closeCommentsBtn').onclick = () => {
    document.getElementById('commentPanel').classList.remove('visible');
  };

  window.openSite = (index) => {
    currentSite = data.sites[index];
    document.getElementById('siteTitle').innerText = currentSite.name;
    document.getElementById('addTaskBtn').style.display = 'inline-block';
    document.getElementById('commentPanel').classList.remove('visible');
    renderSites();
    renderTasks();
  };

  window.toggleDone = (index) => {
    currentSite.tasks[index].done = !currentSite.tasks[index].done;
    renderTasks(); // re-render so tasks are reordered
  };

  window.openComments = (index) => {
    currentTaskIndex = index;
    document.getElementById('commentPanel').classList.add('visible');
    renderComments();
  };

  renderSites();
});

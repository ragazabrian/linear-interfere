/* ==========================================================================
   Linear x Interfere - Command Palette Logic (Cmd+K)
   ========================================================================== */

class CommandMenu {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.selectedIndex = 0;
    this.filteredCommands = [...INITIAL_DATA.commands];

    this.backdrop = document.getElementById('commandMenuBackdrop');
    this.searchInput = document.getElementById('commandSearchInput');
    this.listContainer = document.getElementById('commandList');

    this.init();
  }

  init() {
    if (!this.backdrop || !this.searchInput || !this.listContainer) return;

    // Search input event
    this.searchInput.addEventListener('input', (e) => {
      this.filter(e.target.value);
    });

    // Close when clicking backdrop
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    // Keyboard navigation within menu
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
        this.renderList();
        this.app.playSound('blip');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.renderList();
        this.app.playSound('blip');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.backdrop.classList.add('open');
    this.searchInput.value = '';
    this.filteredCommands = [...INITIAL_DATA.commands];
    this.selectedIndex = 0;
    this.renderList();
    setTimeout(() => this.searchInput.focus(), 50);
    this.app.playSound('click');
  }

  close() {
    this.isOpen = false;
    this.backdrop.classList.remove('open');
    this.app.playSound('click');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  filter(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredCommands = [...INITIAL_DATA.commands];
    } else {
      this.filteredCommands = INITIAL_DATA.commands.filter(cmd => 
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.shortcut.toLowerCase().includes(q)
      );
    }
    this.selectedIndex = 0;
    this.renderList();
  }

  renderList() {
    this.listContainer.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      this.listContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-tertiary); font-size: 0.8125rem;">
          No matching actions found.
        </div>
      `;
      return;
    }

    this.filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `command-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="command-item-left">
          <span class="command-item-icon">›</span>
          <span class="command-item-title">${cmd.title}</span>
        </div>
        <div class="command-item-right">
          <span class="kbd">${cmd.shortcut}</span>
        </div>
      `;

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = idx;
        this.renderList();
      });

      item.addEventListener('click', () => {
        this.selectedIndex = idx;
        this.executeSelected();
      });

      this.listContainer.appendChild(item);
    });

    // Auto-scroll to selected
    const selectedEl = this.listContainer.children[this.selectedIndex];
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  executeSelected() {
    const cmd = this.filteredCommands[this.selectedIndex];
    if (!cmd) return;

    this.close();
    this.app.playSound('click');

    switch (cmd.id) {
      case 'new-issue':
        this.app.openIssueModal();
        break;
      case 'jump-board':
        document.getElementById('boardSection')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'jump-roadmap':
        document.getElementById('roadmapSection')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'jump-agents':
        document.getElementById('agentSection')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'jump-changelog':
        document.getElementById('changelogSection')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'toggle-theme':
        this.app.toggleTheme();
        break;
      case 'toggle-sound':
        this.app.toggleSound();
        break;
      case 'copy-link':
        navigator.clipboard?.writeText(window.location.href);
        this.app.showToast('Copied page URL to clipboard!');
        break;
      case 'open-github':
        window.open('https://github.com/ragazabrian/linear-interfere', '_blank');
        break;
    }
  }
}

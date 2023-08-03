const profileContentsId = 'user-profile-contents';

window.addEventListener(
  'load',
  async () => {
    const contentsElement = document.getElementById(profileContentsId);

    if (contentsElement != null) {
      const response = await window.fetch('/api/profile', {
        method: 'get',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const profile = await response.json();
        addProfileInformation(profile, contentsElement);
      }
    }
  },
  false,
);

const addProfileInformation = (profile, contentsElement) => {
  const values = [
    ['Lucid ID', `${profile.id}`],
    ['Email', profile.email],
    ['Username', profile.username],
    ['Full name', profile.fullName],
  ];

  for (const value of values) {
    const liElement = document.createElement('li');
    liElement.innerText = `${value[0]}: ${value[1]}`;

    contentsElement.appendChild(liElement);
  }
};

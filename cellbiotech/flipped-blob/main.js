const flipBlobRight = document.querySelector('.flip-blob.right');

flipBlobRight.addEventListener('click', function () {
  const tableContent = document.querySelector('.table-content');
  if (this.childNodes[1].style.transform) {
    this.childNodes[1].removeAttribute('style');
    tableContent.style.height = 0;
  } else {
    this.childNodes[1].style.transform = 'rotateY(180deg)';
    tableContent.style.height = '70%';
  }
})

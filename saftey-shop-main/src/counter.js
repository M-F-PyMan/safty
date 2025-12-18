export function setupCounter(element, initialValue = 0) {
  let counter = initialValue;

  const render = () => {
    element.textContent = `count is ${counter}`;
  };

  const increment = () => {
    counter++;
    render();
  };

  element.addEventListener('click', increment);

  // مقدار اولیه
  render();

  // اگر خواستی بیرون هم کنترل داشته باشی:
  return {
    get value() {
      return counter;
    },
    set value(val) {
      counter = Number(val) || 0;
      render();
    },
    increment,
    reset() {
      counter = initialValue;
      render();
    }
  };
}

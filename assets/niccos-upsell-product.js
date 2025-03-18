class ProductsUpsellPopup {
  constructor() {
    this.popup = document.getElementById('niccos-products-popup');
    if (!this.popup) return;

    this.addButtons = this.popup.querySelectorAll('.add-product-button');
    this.checkoutButton = this.popup.querySelector('.upsell-popup__add-cart');
    this.cancelButton = this.popup.querySelector('.upsell-popup__cancel');
    this.closeButton = this.popup.querySelector('.upsell-popup__close');
    this.prevButton = this.popup.querySelector('.slider-nav.prev');
    this.nextButton = this.popup.querySelector('.slider-nav.next');
    this.slider = this.popup.querySelector('.upsell-popup__products-slider');
    this.sliderContainer = this.popup.querySelector('.upsell-popup__products');
    
    this.selectedProducts = new Map();
    
    this.variantSheet = this.popup.querySelector('.variant-selector-sheet');
    this.variantSheetClose = this.popup.querySelector('.variant-selector-close');
    this.currentProduct = null;
    this.variantSelectorOverlay = document.querySelector('.variant-selector-overlay');
    

    if(this.prevButton){
      this.prevButton.style.visibility = 'hidden';

    }
    this.bindEvents();
  }

  bindEvents() {
    // Product selection
    this.addButtons?.forEach(button => {
      button.addEventListener('click', (e) => this.handleProductSelection(e));
    });

    // Checkout
    this.checkoutButton?.addEventListener('click', () => this.handleCheckout());

    // Cancel and close
    this.cancelButton?.addEventListener('click', () => this.close());
    this.closeButton?.addEventListener('click', () => this.close());
    this.variantSheetClose?.addEventListener('click', () => this.closeVariantSheet());
    this.variantSelectorOverlay?.addEventListener('click', () => this.closeVariantSheet());

    // Slider navigation
    this.prevButton?.addEventListener('click', () => this.handleSlide('prev'));
    this.nextButton?.addEventListener('click', () => this.handleSlide('next'));
    this.slider?.addEventListener('scroll', () => this.updateNavButtons());

    // Add resize listener to update navigation visibility
    window.addEventListener('resize', () => this.updateNavButtons());

    // Add event delegation for selected variant clicks
    this.popup.addEventListener('click', (e) => {
      const selectedVariant = e.target.closest('.selected-variant');
      if (selectedVariant) {
        const product = selectedVariant.closest('.upsell-popup__product');
        this.openVariantSheet(product);
      }
    });

    // Add swipe functionality for desktop
    if (this.slider) {
      let touchstartX = 0;
      let touchendX = 0;
      const swipeThreshold = 50; // minimum distance for a swipe

      // Add cursor style
      this.slider.style.cursor = 'pointer';
      
      // Prevent default drag behavior
      this.slider.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });

      this.slider.addEventListener('mousedown', (e) => {
        touchstartX = e.clientX;
      });

      this.slider.addEventListener('mouseup', (e) => {
        touchendX = e.clientX;
        handleSwipe();
      });

      const handleSwipe = () => {
        const swipeDistance = touchendX - touchstartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
          if (swipeDistance > 0) {
            // Swipe right - go to previous
            this.handleSlide('prev');
          } else {
            // Swipe left - go to next
            this.handleSlide('next');
          }
        }
      };
    }
  }

  handleProductSelection(event) {
    this.button = event.currentTarget;
    const product = this.button.closest('.upsell-popup__product');
    const variants = JSON.parse(product.dataset.variants);
    const hasVariants = product.dataset.hasVariants === 'true';
    
    // Check if the product is already added
    const isProductAdded = Array.from(this.selectedProducts.values()).some(product => product.title === this.button.dataset.productTitle);

    if (isProductAdded) {
      // Remove the product from selection
      for (const [key, value] of this.selectedProducts.entries()) {
        if (value.title === this.button.dataset.productTitle) {
          this.selectedProducts.delete(key);
          break;
        }
      }
      this.updateSelectionStyle(this.button, false);
      this.resetProductSelection(product);
    } else {
      if (hasVariants) {
        const variantId = this.button.dataset.variantId;
        const price = parseFloat(this.button.dataset.productPrice);
        this.currentProduct = product;
        this.selectedProducts.set(variantId, {
          id: variantId,
          price: price,
          title: this.button.dataset.productTitle
        });


        const selectedVariant = variants.find(variant => variant.id == variantId);
        const priceContainer = this.currentProduct.querySelector('.upsell-popup__price');
           // Update or add selected variant display
      let selectedVariantDisplay = this.currentProduct.querySelector('.selected-variant');
      if (!selectedVariantDisplay) {
        selectedVariantDisplay = document.createElement('div');
        selectedVariantDisplay.className = 'selected-variant';
        priceContainer.after(selectedVariantDisplay);
      }
      selectedVariantDisplay.textContent = selectedVariant.options.join(' / ');

        this.updateSelectionStyle(this.button, true);
        this.openVariantSheet(product);
      } else {
        // Handle non-variant products as before
        const variantId = this.button.dataset.variantId;
        const price = parseFloat(this.button.dataset.productPrice);

        if (this.selectedProducts.has(variantId)) {
          this.selectedProducts.delete(variantId);
          this.updateSelectionStyle(this.button, false);
        } else {
          this.selectedProducts.set(variantId, {
            id: variantId,
            price: price,
            title: this.button.dataset.productTitle
          });
          this.updateSelectionStyle(this.button, true);
        }
      }
    }

    this.updateCheckoutButton();
  }

  updateCheckoutButton() {
    const hasProducts = this.selectedProducts.size > 0;
    this.checkoutButton.disabled = !hasProducts;
    const totalPrice = Array.from(this.selectedProducts.values()).reduce((total, product) => total + product.price, 0);
    this.checkoutButton.innerHTML = hasProducts ? `In den Warenkorb ${this.formatMoney(totalPrice/100,true,this.currentProduct.dataset.currency)}` : 'In den Warenkorb';
  }

  async handleCheckout() {
    if (this.selectedProducts.size === 0) return;

    try {
      this.checkoutButton.disabled = true;
      this.checkoutButton.innerHTML = 'Wird zum Warenkorb hinzugefügt...';

      const items = Array.from(this.selectedProducts.values()).map(product => ({
        id: product.id,
        quantity: 1
      }));

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) throw new Error('Cart add failed');
     this.close();
    } catch (error) {
      console.error('Error:', error);
      this.checkoutButton.innerHTML = 'Ein Fehler ist aufgetreten';
    }
  }

  handleSlide(direction) {
    if (!this.slider) return;
    
    // Calculate scroll amount based on slider width
    const scrollAmount = this.slider.offsetWidth * 0.8; // Scroll 80% of visible width
    const amount = direction === 'prev' ? -scrollAmount : scrollAmount;
    
    this.slider.scrollBy({
      left: amount,
      behavior: 'smooth'
    });
  }

  updateNavButtons() {
    if (!this.slider || !this.prevButton || !this.nextButton) return;

    // Check if content is scrollable
    const isScrollable = this.slider.scrollWidth > this.slider.clientWidth;
    
    // Show/hide navigation buttons based on scrollability
    this.prevButton.style.display = isScrollable ? 'flex' : 'none';
    this.nextButton.style.display = isScrollable ? 'flex' : 'none';

    if (isScrollable) {
      const isAtStart = this.slider.scrollLeft <= 10;
      const isAtEnd = this.slider.scrollLeft >= this.slider.scrollWidth - this.slider.clientWidth - 10;
      
      this.prevButton.style.visibility = isAtStart ? 'hidden' : 'visible';
      this.prevButton.disabled = isAtStart;
      this.nextButton.style.visibility = isAtEnd ? 'hidden' : 'visible';
      this.nextButton.disabled = isAtEnd;
    }
  }

  close() {
    this.popup.style.display = 'none';
    window.CartDrawer.getCart();
    // window.CartDrawer.renderCartDrawer();
  }

  open() {
    this.popup.style.display = 'block';
    this.updateNavButtons();
  }

  formatMoney(amount, format = true, formateCurrency) {
    const currencyFormat = formateCurrency ? formateCurrency : (this.currentProduct ? this.currentProduct.dataset.currency : '{{amount}} €');
    if (format) {
      return currencyFormat.replace('{{amount}}', parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    } else {
      return currencyFormat.replace('{{amount}}', parseFloat(amount).toFixed(2)).replace(/\D00(?=\D*$)/, '');
    }
  }

  openVariantSheet(product) {
    this.currentProduct = product;
    
    // Get product data
    const img = product.querySelector('.upsell-popup__image img');
    const title = product.querySelector('.upsell-popup__title');
    const variants = JSON.parse(product.dataset.variants);
    const options = JSON.parse(product.dataset.options);
    const selectedVariant = this.button.dataset.selectedVariant;
    
    // Update variant sheet content with enhanced header layout
    const headerHtml = `
      <div class="variant-selector-header">
        <div class="variant-header-left">
          <img class="variant-product-image" src="${img.src}" alt="${img.alt}">
          <div class="variant-header-info">
            <h3 class="variant-product-title">${title.textContent}</h3>
            <div class="variant-header-price">
              <span class="variant-sheet-price"></span>
              <span class="variant-sheet-compare-price "></span>
            </div>
             <span class="variant-sheet-unit-price unit-price"></span>
          </div>
        </div>
        <button class="variant-selector-close" aria-label="Schließen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;

    // Replace existing header
    const existingHeader = this.variantSheet.querySelector('.variant-selector-header');
    existingHeader.outerHTML = headerHtml;

    // Re-attach close button event listener
    this.variantSheetClose = this.variantSheet.querySelector('.variant-selector-close');
    this.variantSheetClose.addEventListener('click', () => this.closeVariantSheet());

    // Update variant sheet pricing
    const variantSheetPrice = this.variantSheet.querySelector('.variant-sheet-price');
    const variantSheetComparePrice = this.variantSheet.querySelector('.variant-sheet-compare-price');
    const variantSheetUnitPrice = this.variantSheet.querySelector('.variant-sheet-unit-price');
    const selectedVariantObj = variants.find(variant => variant.id == selectedVariant);
    
    if(variantSheetUnitPrice){
      const unit = selectedVariantObj.unit_price_measurement.reference_unit;
      variantSheetUnitPrice.textContent = this.formatMoney(selectedVariantObj.unit_price/100) + '/' + unit;
    }
    
    variantSheetPrice.textContent = this.formatMoney(selectedVariantObj.price/100);
    if (selectedVariantObj.compare_at_price && selectedVariantObj.compare_at_price > selectedVariantObj.price) {
      variantSheetComparePrice.textContent = this.formatMoney(selectedVariantObj.compare_at_price/100);
      variantSheetComparePrice.style.display = 'inline';
    } else {
      variantSheetComparePrice.style.display = 'none';
    }

    // Render variant options
    this.renderVariantOptions(options, variants, selectedVariant);

    // Show the variant sheet
    this.variantSheet.classList.add('active');
    this.variantSelectorOverlay.classList.add('active');
  }

  renderVariantOptions(options, variants, selectedVariant) {
    const optionsContainer = this.variantSheet.querySelector('.subscription-popup__variants');
    optionsContainer.innerHTML = '';

    const currentVariant = variants.find(variant => variant?.id == selectedVariant);
    

    // Group variants by option values and attach pricing
    const groupedVariants = {};
    variants.forEach(variant => {
      variant.options.forEach((optionValue, index) => {
        if (!groupedVariants[options[index].name]) {
          groupedVariants[options[index].name] = {};
        }
        
        // Get previously selected options
        const previousOptions = currentVariant.options.slice(0, index);
        const isPreviousMatch = variant.options
          .slice(0, index)
          .every((opt, i) => opt === previousOptions[i]);
        
        // Only update price if previous options match or if it's the first option
        if (index === 0 || isPreviousMatch) {
          groupedVariants[options[index].name][optionValue] = {
            price: variant.price,
            compareAtPrice: variant.compare_at_price,
            unit_price: variant.unit_price,
            unit_price_measurement: variant.unit_price_measurement
          };
        }
      });
    });

    // Convert grouped variants to array format matching options structure
    options = options.map(option => ({
      ...option,
      values: Object.entries(groupedVariants[option.name]).map(([value, pricing]) => ({
        value,
        ...pricing
      }))
    }));

    // Get selected options
    const selectedOptions = {};
    this.variantSheet.querySelectorAll('.variant-box.selected').forEach(selectedOption => {
      const optionPosition = selectedOption.closest('.variant-boxes').dataset.optionPosition;
      selectedOptions[optionPosition] = selectedOption.dataset.optionValue;
    });

    options.forEach((option, index) => {
      // Filter option values based on selected options
      const filteredValues = option.values.filter(({ value }) => {
        if (index === 0) {
          // Always show all values for the first option
          return true;
        } else {
          // Filter values based on the selected options of previous options
          return Object.keys(selectedOptions).every(position => {
            if (position >= option.position) return true;
            const selectedValue = selectedOptions[position];
            return variants.some(variant =>
              variant.options[position - 1] === selectedValue &&
              variant.options[option.position - 1] === value
            );
          });
        }
      });

      const optionHtml = `
        <div class="option-wrapper">
          <label>${option.name}</label>
          <div class="variant-boxes" data-option-position="${option.position}">
            ${filteredValues.map(({ value, price, compareAtPrice }) => {
              const isImageSwatch = option.name.includes('Anzahl');
              const isSelected = currentVariant.options.includes(value);

              // Check if the option value is compatible with the selected options
              const isCompatible = Object.keys(selectedOptions).every(position => {
                if (position === option.position) return true;
                const selectedValue = selectedOptions[position];
                return variants.some(variant =>
                  variant.options[position - 1] === selectedValue &&
                  variant.options[option.position - 1] === value
                );
              });

              let unitPrice = price
              if(isImageSwatch){
                let quantity = value.split(" ")?.[0]
                quantity = parseInt(quantity) || 1
                 unitPrice = price/quantity

              }

              return `
                <button 
                  type="button"
                  class="variant-box ${isImageSwatch ? 'variant-box-image' : ''} ${isSelected ? 'selected' : ''} ${isCompatible ? '' : 'disabled'}"
                  data-variant-id="${currentVariant.id}"
                  data-price="${price}"
                  data-option-value="${value}"
                  ${isCompatible ? '' : 'disabled'}
                >
                  <span class="variant-box-text">${value}</span>
                  ${isImageSwatch ? `
                    <span class="swatch-price">${this.formatMoney(unitPrice/100,true,this.currentProduct.dataset.currency)}/ Stk.</span>
                    ${compareAtPrice ? `
                      <span class="swatch-badge">
                        Spare ${Math.round((1 - price / compareAtPrice) * 100)}%
                      </span>
                    ` : ''}
                  ` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
      optionsContainer.insertAdjacentHTML('beforeend', optionHtml);
    });

    // Add event listeners to new buttons
    optionsContainer.querySelectorAll('.variant-box:not(.disabled)').forEach(button => {
      button.addEventListener('click', (e) => this.handleVariantSelection(e));
    });
  }

  handleVariantSelection(event) {
    const button = event.currentTarget;
    const variantBoxes = button.closest('.variant-boxes');
    const addButton = this.currentProduct.querySelector('.add-product-button');
    const circle = addButton.querySelector('.button-circle');

    // Update selection state
    variantBoxes.querySelectorAll('.variant-box').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');

    // Get selected options
    const selectedOptions = {};
    this.variantSheet.querySelectorAll('.variant-box.selected').forEach(selectedOption => {
      const optionPosition = selectedOption.closest('.variant-boxes').dataset.optionPosition;
      selectedOptions[optionPosition] = selectedOption.dataset.optionValue;
    });

    // Get variants data from product
    const variants = JSON.parse(this.currentProduct.dataset.variants);
    
    // Find the matching variant based on selected options
    const selectedVariant = variants.find(variant => {
      return Object.keys(selectedOptions).every(position => {
        return variant.options[position - 1] === selectedOptions[position];
      });
    });

    if (selectedVariant) {
      // Update product data
      addButton.dataset.variantId = selectedVariant.id;
      addButton.dataset.productPrice = selectedVariant.price;
      addButton.dataset.selectedVariant = selectedVariant.id;
      addButton.dataset.comparePrice = selectedVariant.compare_at_price;

      // Update product price display
      const priceContainer = this.currentProduct.querySelector('.upsell-popup__price');
      const salePrice = priceContainer.querySelector('.sale-price');
      let compareAtPrice = priceContainer.querySelector('.compare-at-price');
      const unitPrice = priceContainer.querySelector('.unit-price');
      salePrice.textContent = this.formatMoney(selectedVariant.price/100);
      if(unitPrice){
        unitPrice.textContent = this.formatMoney(selectedVariant.unit_price/100) + '/' + selectedVariant.unit_price_measurement.reference_unit;
      }
      
      if (selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price) {
        if (!compareAtPrice) {
          compareAtPrice = document.createElement('span');
          compareAtPrice.className = 'compare-at-price';
          salePrice.after(compareAtPrice);
        }
        compareAtPrice.textContent = this.formatMoney(selectedVariant.compare_at_price/100);
      } else if (compareAtPrice) {
        compareAtPrice.remove();
      }

      // Update variant sheet pricing
      const variantSheetPrice = this.variantSheet.querySelector('.variant-sheet-price');
      const variantSheetComparePrice = this.variantSheet.querySelector('.variant-sheet-compare-price');
      const variantSheetUnitPrice = this.variantSheet.querySelector('.variant-sheet-unit-price');
      variantSheetPrice.textContent = this.formatMoney(selectedVariant.price/100);
      if(variantSheetUnitPrice){
        const unit = selectedVariant.unit_price_measurement.reference_unit;
        variantSheetUnitPrice.textContent = this.formatMoney(selectedVariant.unit_price/100) + '/' + unit;
      }
        
      if (selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price) {
        variantSheetComparePrice.textContent = this.formatMoney(selectedVariant.compare_at_price/100);
        variantSheetComparePrice.style.display = 'inline';
      } else {
        variantSheetComparePrice.style.display = 'none';
      }

      // Update or add selected variant display
      let selectedVariantDisplay = this.currentProduct.querySelector('.selected-variant');
      if (!selectedVariantDisplay) {
        selectedVariantDisplay = document.createElement('div');
        selectedVariantDisplay.className = 'selected-variant';
        priceContainer.after(selectedVariantDisplay);
      }
      selectedVariantDisplay.textContent = selectedVariant.options.join(' / ');

      // Check if the selected variant is already added
      const isVariantAdded = Array.from(this.selectedProducts.values()).some(product => product.id === selectedVariant.id);

      if (isVariantAdded) {
        // Remove the selected variant from selection
        this.selectedProducts.delete(selectedVariant.id);
        circle.setAttribute('fill', '#05371E');
      } else {
        // Add the selected variant to selection
        // Override any existing product with same title
        for (const [key, value] of this.selectedProducts.entries()) {
          if (value.title === addButton.dataset.productTitle) {
            this.selectedProducts.delete(key);
          }
        }
        // Add new variant
        this.selectedProducts.set(selectedVariant.id, {
          id: selectedVariant.id,
          price: selectedVariant.price,
          comparePrice: selectedVariant.compare_at_price,
          title: addButton.dataset.productTitle,
          variant: selectedVariant.options.join(' / ')
        });
        circle.setAttribute('fill', '#14BE5F');
      }
    } else {
      console.warn('No matching variant found for selected options');
    }

    // Re-render variant options with updated selection
    this.renderVariantOptions(JSON.parse(this.currentProduct.dataset.options), variants, selectedVariant?.id);



      


    

    // Update checkout button
    this.updateCheckoutButton();
  }

  closeVariantSheet() {
    if (this.variantSheet) {
      this.variantSheet.classList.remove('active');
      this.variantSelectorOverlay.classList.remove('active');
      this.currentProduct = null;
    }
  }

  updateSelectionStyle(button, isSelected) {
    const circle = button.querySelector('.button-circle');
    circle.setAttribute('fill', isSelected ? '#14BE5F' : '#05371E');


  }

  resetProductSelection(product) {
    // Reset to default values
    const defaultVariantId = this.button.dataset.defaultVariantId;
    const defaultVariantPrice = parseFloat(this.button.dataset.defaultVariantPrice);
    const defaultVariantComparePrice = parseFloat(this.button.dataset.defaultVariantComparePrice);

    this.button.dataset.variantId = defaultVariantId;
    this.button.dataset.productPrice = defaultVariantPrice;
    this.button.dataset.selectedVariant = defaultVariantId;
    this.button.dataset.comparePrice = defaultVariantComparePrice;

    // Update product price display
    const priceContainer = product.querySelector('.upsell-popup__price');
    const salePrice = priceContainer.querySelector('.sale-price');
    let compareAtPrice = priceContainer.querySelector('.compare-at-price');
    
    salePrice.textContent = this.formatMoney(defaultVariantPrice/100,true,this.button.dataset.currency);
    
    if (defaultVariantComparePrice && defaultVariantComparePrice > defaultVariantPrice) {
      if (!compareAtPrice) {
        compareAtPrice = document.createElement('span');
        compareAtPrice.className = 'compare-at-price';
        salePrice.after(compareAtPrice);
      }
      compareAtPrice.textContent = this.formatMoney(defaultVariantComparePrice/100);
    } else if (compareAtPrice) {
      compareAtPrice.remove();
    }

    // Remove selected variant display
    const selectedVariantDisplay = product.querySelector('.selected-variant');
    if (selectedVariantDisplay) {
      selectedVariantDisplay.remove();
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('niccos-products-popup');
  if(popup){
   let productsPopup = new ProductsUpsellPopup();
    window.niccosPopups = {
      productsPopup: productsPopup,
    };
   
  }
  
});
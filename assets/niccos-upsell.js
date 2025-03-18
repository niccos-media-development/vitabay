class NiccosPopup {
  constructor(popupId, popupType) {
    this.popup = document.getElementById(popupId);
    this.product = this.popup.dataset.product?.[0] ? JSON.parse(this.popup.dataset.product)?.[0] : {};
   this.currency = this.popup.dataset.currency;
    this.overlay = this.popup.querySelector(`.${popupType}-popup__overlay`);
    this.closeButton = this.popup.querySelector(`.${popupType}-popup__close`);
    this.frequencySelect = this.popup.querySelector('.frequency-select');
    this.continueButton = this.popup.querySelector('.subscription-popup__continue');
    this.initialVariantData = null;
    this.content = this.popup.querySelector(`.${popupType}-popup__content`);
    this.isMobile = window.innerWidth <= 767;
    this.selectedOptions = [];

    this.bindEvents();
    this.initializeVariantSelectors();
   

    // Only initialize mobile-specific features if on mobile
    if (this.isMobile) {
      this.initializeMobileDrawer();
    }

    this.updateSwatchPrices();
    // Handle resize events to update mobile/desktop state
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 767;
      
      // If switching between mobile/desktop, reinitialize
      if (wasMobile !== this.isMobile) {
        if (this.isMobile) {
          this.initializeMobileDrawer();
        } else {
          this.destroyMobileDrawer();
        }
      }
    });
  }

  initializeMobileDrawer() {
    this.touchStartY = null;
    this.currentTranslateY = 0;
    
    // Add touch event listeners
    this.content.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.content.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.content.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  destroyMobileDrawer() {
    // Remove touch event listeners
    this.content.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.content.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.content.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Reset any mobile-specific styles
    this.content.style.transform = '';
    this.content.style.transition = '';
  }

  handleTouchStart(event) {
    // Only handle touch events if we're at the top of the content
    if (this.content.scrollTop <= 0) {
      this.touchStartY = event.touches[0].clientY;
      this.content.style.transition = 'none';
    }
  }

  handleTouchMove(event) {
    if (!this.touchStartY) return;

    const currentY = event.touches[0].clientY;
    const diff = currentY - this.touchStartY;
    
    // Only allow dragging down
    if (diff < 0) {
      this.touchStartY = null;
      return;
    }
    
    // Prevent default scroll when dragging
    event.preventDefault();
    
    // Reduce movement as user drags further
    this.currentTranslateY = diff * 0.5;
    
    this.content.style.transform = `translateY(${this.currentTranslateY}px)`;
  }

  handleTouchEnd() {
    if (!this.touchStartY) return;
    
    this.content.style.transition = 'transform 0.3s ease-out';
    
    // If dragged more than 150px down, close the popup
    if (this.currentTranslateY > 150) {
      this.close();
    } else {
      // Reset position
      this.content.style.transform = 'translateY(0)';
    }
    
    this.touchStartY = null;
    this.currentTranslateY = 0;
  }

  bindEvents() {
    this.closeButton.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", () => this.close());
    this.frequencySelect && this.frequencySelect.addEventListener('change', (e) => this.updateDiscount(e.target.value));
    this.continueButton.addEventListener("click", () => this.close());

    // Add event listeners for add to cart buttons
    const addToCartButtons = this.popup.querySelectorAll('.subscription-popup__add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToCart(e));
    });
  }

  async handleAddToCart(event) {
    const button = event.currentTarget;
    const productContainer = button.closest('.subscription-popup__product');
    
    // Find selected variant based on option combinations
    const selectedVariant = this.findSelectedVariant();


    
    try {
      button.disabled = true;
      button.textContent = 'Wird hinzugefügt...';

      const formData = {
        items: [{
          id: selectedVariant?.id || button.dataset.variantId,
          quantity: 1
        }]
      };


      // Add selling plan if frequency is selected
      if (this.frequencySelect && this.frequencySelect.value) {
        formData.items[0].selling_plan = this.frequencySelect.value;
      }



      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Add to cart failed');
      this.close();
      // Close popup and open cart drawer
      
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      button.textContent = 'Fehler - Erneut versuchen';
    } finally {
      button.disabled = false;
    }
  }

  findSelectedVariant() {
    // Get all selected option values
    const optionSelectors = this.popup.querySelectorAll('.variant-box.selected');
    this.selectedOptions = [];

   
    
    
    optionSelectors.forEach((selector,index )=> {

    
      const optionIndex = selector.dataset.optionIndex;
      const optionValue = selector.dataset.optionValue;
      if (optionValue) {
        this.selectedOptions[index] = optionValue;
      }
    });

    // Log selected options and variants for debugging
   

   

    // Find the variant that matches all selected options
    return this.product.variants?.find(variant => {
      return variant.options.every((option, index) => {
        return option === this.selectedOptions[index];
      });
    });
  }

  open() {
    try {
      if (!this.popup) {
        console.error('Popup element not found');
        return;
      }
      this.popup.style.display = "block";
      document.body.style.overflow = "hidden";
      
      // Reset any transform on open for mobile
      if (this.isMobile && this.content) {
        this.content.style.transform = 'translateY(0)';
      }
      
      this.initializeVariantSelectors();
    } catch (error) {
      console.error('Error opening popup:', error);
    }
  }

  close() {
    window.CartDrawer.getCart();
    // window.CartDrawer.renderCartDrawer();
    if (this.isMobile) {
      // Animate out for mobile
      this.content.style.transform = 'translateY(100%)';
      setTimeout(() => {
        this.popup.style.display = "none";
        document.body.style.overflow = "";
        // Reset transform after animation
        this.content.style.transform = '';
      }, 300);
    } else {
      // Immediate close for desktop
      this.popup.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  updateDiscount(planId) {
    const planDiscount = this.frequencySelect.querySelector(`option[value="${planId}"]`).dataset.planDiscount;
    const badge = this.popup.querySelector('.badge');
    badge.textContent = `Save ${planDiscount}%`;
  }

  initializeVariantSelectors() {
    const variantBoxes = this.popup.querySelectorAll('.variant-box');

    
    // Ensure first variant is selected by default
    if (variantBoxes.length > 0) {
      const firstVariant = variantBoxes[0];
      firstVariant.classList.add('selected');
      const unitPrice = firstVariant.dataset.unitPrice;
      // Trigger initial price update
      const productContainer = firstVariant.closest('.subscription-popup__product');
      const priceElement = productContainer?.querySelector('[data-product-price]');
      const comparePriceElement = productContainer?.querySelector('[data-product-compare-price]');
      const addToCartButton = productContainer?.querySelector('.subscription-popup__add-to-cart');
      
      if (priceElement) {
        const initialPrice = firstVariant.dataset.subscriptionPrice || firstVariant.dataset.price;
        priceElement.textContent = initialPrice;
        
        if (addToCartButton) {
          addToCartButton.dataset.variantId = firstVariant.dataset.variantId;
          addToCartButton.textContent = `Add to Cart - ${initialPrice}`;
        }
      }
      
      if (comparePriceElement) {
        const comparePrice = firstVariant.dataset.comparePrice;
        if(comparePrice){
          comparePriceElement.textContent = comparePrice;
          comparePriceElement.style.display = comparePrice ? 'inline' : 'none';
        }
      }
      if(unitPrice){
        const unitPriceElement = productContainer?.querySelector('[data-product-unit-price]');
        if(unitPriceElement){
          unitPriceElement.textContent = unitPrice;
        }
      }
    }
    
    variantBoxes.forEach(box => {
      box.addEventListener('click', (e) => {
        const variantBox = e.target.closest('.variant-box');
        if (!variantBox) return;

        // Remove selected class from all variant boxes in the same container
        const variantContainer = variantBox.closest('.variant-boxes');
        variantContainer.querySelectorAll('.variant-box').forEach(b => {
          b.classList.remove('selected');
        });
        
        // Add selected class to clicked variant box
        variantBox.classList.add('selected');
        
        // Update prices based on selected variant
        this.updatePrices(variantBox);
      });
    });
  }

  updatePrices(variantBox) {
    const productContainer = variantBox.closest('.subscription-popup__product');
    const priceElement = productContainer.querySelector('[data-product-price]');
    const comparePriceElement = productContainer.querySelector('[data-product-compare-price]');
    const addToCartButton = productContainer.querySelector('.subscription-popup__add-to-cart');
    const selectedSellingPlan = this.frequencySelect?.value;
    
    // Find the selected variant based on all option combinations
    const selectedVariant = this.findSelectedVariant();
    
    if (selectedVariant) {
      // Update swatch prices
      this.updateSwatchPrices();

      let price = selectedVariant.price;
      let comparePrice = selectedVariant.compare_at_price;
      let unitPrice = selectedVariant.unit_price;

      // If there's a selected selling plan, use per_delivery_price
      if (selectedSellingPlan && selectedVariant.selling_plan_allocations?.length > 0) {
        const allocation = selectedVariant.selling_plan_allocations.find(
          allocation => allocation.selling_plan_id.toString() === selectedSellingPlan
        );
        if (allocation) {
          price = allocation.per_delivery_price;
          comparePrice = selectedVariant.price; // Use regular price as compare price for subscription
          unitPrice = allocation.unit_price;
        }
      }

      const formattedPrice = this.formatMoney(price);
      const formattedComparePrice = comparePrice ? this.formatMoney(comparePrice) : null;
      const variantId = selectedVariant.id;
      // const unitPrice = selectedVariant.unit_price;

      // Update displayed prices
      if (priceElement) {
        priceElement.textContent = formattedPrice;
      }

      if (comparePriceElement) {
        if (formattedComparePrice && comparePrice > price) {
          comparePriceElement.textContent = formattedComparePrice;
          comparePriceElement.style.display = 'inline';
        } else {
          comparePriceElement.style.display = 'none';
        }
      }

      // Update add to cart button
      if (addToCartButton) {
        addToCartButton.dataset.variantId = variantId;
        addToCartButton.textContent = `In den Warenkorb - ${formattedPrice}`;
      }

      if (unitPrice) {
        const unitPriceElement = productContainer?.querySelector('[data-product-unit-price]');
        if (unitPriceElement) {
          const unit = selectedVariant.unit_price_measurement.reference_unit;
          unitPriceElement.textContent = `${this.formatMoney(unitPrice)}/${unit}`;
        }
      }
    }
  }

  updateSwatchPrices() {
    const swatchPriceElements = this.popup.querySelectorAll('.swatch-price');
    const options = this.product.options;
    const selectedSellingPlan = this.frequencySelect?.value;
    
    for (let i = 0; i < swatchPriceElements.length; i++) {
      const swatchElement = swatchPriceElements[i];
      const index = options.findIndex(option => option === swatchElement.dataset.optionindex);
      
      // Get selected options up to current index
      let optionArray = this.selectedOptions?.slice(0, index);
      
      // Find matching variants based on previous selections
      const matchingVariants = this.product.variants.filter(variant => {
        return variant.options.slice(0, optionArray.length).every((option, idx) => 
          option === optionArray[idx]
        );
      });

      // Find specific variant matching current swatch value
      const variant = matchingVariants.find(variant => 
        variant.options[index] === swatchElement.dataset.optionvalue
      );

      if (variant) {
        let price = variant.price;
        
        // If there's a selected selling plan, use per_delivery_price
        if (selectedSellingPlan && variant.selling_plan_allocations?.length > 0) {
          const allocation = variant.selling_plan_allocations.find(
            allocation => allocation.selling_plan_id.toString() === selectedSellingPlan
          );
          if (allocation) {
            price = allocation.per_delivery_price;
          }
        }
        let quantity = variant.options[index]?.split(" ")?.[0];
        quantity = parseInt(quantity) || 1;
        let unitPrice = price/quantity;
        
        swatchElement.textContent = this.formatMoney(unitPrice,false,this.currency,0) + "/ Stk.";
      }
    }
  }

  formatMoney(amount, format = true, formatCurrency,toFixed=2) {
    const currencyFormat = formatCurrency || `${this.currency}`;
    
    if (format) {
      return currencyFormat.replace('{{amount}}', (amount/100).toFixed(toFixed).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    } else {
      return currencyFormat.replace('{{amount}}', (amount/100).toFixed(toFixed)).replace(/\D00(?=\D*$)/, '');
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {

    
    const upsellPopup = document.getElementById("niccos-subscription-popup");
    if(upsellPopup){
      const subscriptionPopup = new NiccosPopup("niccos-subscription-popup", "subscription");
      window.niccosPopups = {
        subscription: subscriptionPopup,
      };
    }
    
   
   
  } catch (error) {
    console.error('Error initializing popups:', error);
  }
});

const checkBox = document.querySelector('#pharmacy-check_id');
const checkBoxlabel = document.querySelector('#pharmacy-check_id + label');
const list = document.querySelector('.extra-pharmacy-container ul');

const subscriptionExpandButton = document.querySelector('.expand-collapse-container > .expand-option');
const parentWrapperSubscription = subscriptionExpandButton.closest('.product__subs__option');

const pollerLite = (conditions, callback, maxTime = 1000000) => {
  const POLLING_INTERVAL = 25;
  const startTime = Date.now();
  const interval = setInterval(() => {
    const allConditionsMet = conditions.every((condition) => {
      if (typeof condition === 'function') {
        return condition();
      }
      return !!document.querySelector(condition);
    });
    if (allConditionsMet) {
      clearInterval(interval);
      callback();
    } else if (Date.now() - startTime >= maxTime) {
      clearInterval(interval);
    }
  }, POLLING_INTERVAL);
};

const obsIntersection = (target, threshold, callback) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry);
      });
    },
    { threshold: threshold }
  );
  if (!target) {
    return;
  }

  observer?.observe(target);
};

checkBox &&
  checkBox.addEventListener('change', function () {
    if (checkBox.checked) {
      list.style.maxHeight = list.scrollHeight + 'px'; // Set max-height to content height
      list.style.opacity = '1'; // Set max-height to content height
      checkBoxlabel.textContent = 'See less';
    } else {
      list.style.maxHeight = 0; // Collapse to 0
      list.style.opacity = '0';
      checkBoxlabel.textContent = 'See more';
    }
  });

const newGalleryWrapper = () => {
  const html = `
    <div class="product-single__gallery niccos-product-slider">
      <div class="swiper product-single__media-slider niccos-product-swiper">
        <div class="swiper-wrapper">
          
        </div>
      </div>
    </div>
  `;

  return html.trim();
};

//replace swiper instead of flikity

const initSwiper = () => {
  pollerLite([() => window.Swiper !== undefined], () => {
    const swiper = new Swiper('.niccos-product-swiper', {
      slidesPerView: 1.2,
      spaceBetween: 16,
      loop: false,
      breakpoints: {
        0: {
          slidesPerView: 1.2,
        },
      },
    });

    window.productSlider = swiper;
  });
};

pollerLite(['.nico-product-single__wrapper .product-single__media-slider'], () => {
  const galleryElement = document.querySelector('.nico-product-single__wrapper .product-single__media-slider');
  if (!document.querySelector('.niccos-product-slider')) {
    galleryElement.insertAdjacentHTML('beforebegin', newGalleryWrapper());
  }

  const allSlides = Array.from(galleryElement.querySelectorAll('.product-single__media-slide'));
  allSlides.forEach((item, index) => {
    item.setAttribute('data-slide-number', `${index}`);
    const slide = item.cloneNode(true);
    const targetSliderWrapper = document.querySelector('.niccos-product-slider .swiper-wrapper');
    slide.removeAttribute('style');
    slide.classList.add('swiper-slide');
    targetSliderWrapper.appendChild(slide);
  });

  initSwiper();
});

document.body.addEventListener('click', (e) => {
  const { target } = e;
  if (target.closest('.expand-collapse-container > .expand-option')) {
    parentWrapperSubscription?.classList.add('show');
  } else if (target.closest('.niccos-product-slider') && target.closest('.swiper-slide')) {
    e.preventDefault();
    const slider = target.closest('.swiper-slide');
    const sliderNumber = slider.dataset.slideNumber;
    const controlSlider = document.querySelector(
      `.product-single__media-slider.flickity-enabled .product-single__media-slide[data-slide-number="${sliderNumber}"]`
    );

    controlSlider && controlSlider.querySelector('.product-single__media-link').click();
  } else if (target.closest('.nico-product-single__wrapper .product__selectors')) {
    pollerLite(['.product-single__media-slider.flickity-enabled .product-single__media-slide.is-selected'], () => {
      const selectedSlide = document.querySelector(
        '.product-single__media-slider.flickity-enabled .product-single__media-slide.is-selected'
      );
      const selectedSlideNumber = parseInt(selectedSlide.dataset.slideNumber);
      window.productSlider && window.productSlider.slideTo(selectedSlideNumber);
    });
  } else if (target.closest('.mobile-sticky-atc')) {
    const controlAtc = document.querySelector('.nico-product-single__wrapper .product__submit__add');
    controlAtc && controlAtc.click();
  }else if(target.closest('.ruk_rating_snippet') && target.closest('.nico-product-single__wrapper')){
    e.preventDefault();
    const targetElement = document.querySelector('div[id*="shopify-block-reviews"]');
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' // Options: 'start', 'center', 'end', 'nearest'
    });
  }
});

const handleIntersection = (entry) => {
  const stickySection = document.querySelector('.mobile-sticky-atc');
  if (!entry.isIntersecting) {
    stickySection?.classList.add('show');
  } else {
    stickySection?.classList.remove('show');
  }
};

const handleObserver = (selector) => {
  const intersectionAnchor = document.querySelector(selector);
  if (intersectionAnchor) {
    obsIntersection(intersectionAnchor, 0, handleIntersection);
  }
};

pollerLite(['.nico-product-single__wrapper button.product__submit__add'], () => {
  handleObserver('.nico-product-single__wrapper button.product__submit__add');
});

const newRecommendationsWrapper = () => {
  const html = `
    <div class="niccos-products-recommendation">
      <div class="swiper niccos-recommendation-product-swiper">
        <div class="swiper-wrapper">
          
        </div>
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
      </div>
    </div>
  `;

  return html.trim();
};

const initRecommendationSwiper = () => {
  const swiperSelector = '.niccos-recommendation-product-swiper';

  const setupSwiper = () => {
    // Check if viewport width is greater than 767px
    if (window.innerWidth > 767 && !window.recommendationProductSlider) {
      // Initialize Swiper
      window.recommendationProductSlider = new Swiper(swiperSelector, {
        slidesPerView: 4,
        spaceBetween: 8,
        loop: false,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 8,
          },
          992: {
            slidesPerView: 3,
            spaceBetween: 8,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 8,
          },
        },
      });
    }
  };

  // Initial setup
  pollerLite([() => window.Swiper !== undefined], setupSwiper);

  // Update on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 767 && window.recommendationProductSlider) {
      window.recommendationProductSlider.destroy();
      window.recommendationProductSlider = null;
    } else if (window.innerWidth > 767 && !window.recommendationProductSlider) {
      setupSwiper();
    }
  });
};

//recommendation slider
pollerLite(
  [
    '.niccos-related-products .carousel__container > .carousel',
    () =>
      document.querySelectorAll('.niccos-related-products .carousel__container > .carousel .product-grid-item').length,
  ],
  () => {
    const productsWrapper = document.querySelector('.niccos-related-products .carousel__container > .carousel');
    if (!document.querySelector('.niccos-products-recommendation')) {
      productsWrapper.insertAdjacentHTML('beforebegin', newRecommendationsWrapper());
    }

    const allSlides = Array.from(productsWrapper.querySelectorAll('.product-grid-item'));
    allSlides.forEach((item, index) => {
      item.setAttribute('data-slide-number', `${index}`);
      const targetSliderWrapper = document.querySelector('.niccos-recommendation-product-swiper .swiper-wrapper');
      item.classList.add('swiper-slide');
      item.removeAttribute('style');
      targetSliderWrapper.insertAdjacentElement('beforeend', item);
    });

    initRecommendationSwiper();
  }
);

/* Add to cart */
(function() {
  // Add custom code below this line
  
  // Custom Add to Cart Functionality on Custom Variant Template
  const customQuantitySelectors = document.querySelectorAll(".variant-inner-box");
  const customSellingplanAppendCheckbox = document.querySelector(".sellingplan-activation");
  const customATCButton = document.querySelector(".custom-selector-ATC-button");
  if(customQuantitySelectors.length > 0){
    customQuantitySelectors.forEach((quantity)=> quantity.addEventListener("change", handlevariantChange.bind(this), true));
  }
  if(customSellingplanAppendCheckbox){
    customSellingplanAppendCheckbox.addEventListener("change", handleSellingPlan.bind(this), true);
  }
  if(customATCButton){
    customATCButton.addEventListener("click", customOptionATCBtn.bind(this), true);
  }

  function handlevariantChange(event) {
    const Selectedtarget = event.currentTarget;
    if(Selectedtarget){      
      const target = Selectedtarget.querySelector('input');
      if(target){
        const targetID = target.id;
        var targetPosition = target.getAttribute('data-option-position');
         var prod_id = target.getAttribute('data-product-id');
        const targetValue = target.dataset.value;
        const targetSellingPrice = target.getAttribute('data-selling-price');
        const targetSellingComparePrice = target.getAttribute('data-selling-compare-price');
        const targetMainPrice = target.getAttribute('data-main-price');
        const targetSellingSavingPrice = target.getAttribute('data-final-saving-price');
        const data_current_sku = target.getAttribute('data_current_sku');
        const optionWrapper = document.querySelector(`.product__selectors [data-option-position='${targetPosition}']`);
        const sellingPlanActivationCheckbox = document.querySelector(`[data-product-info] .selling_plan_activation_checkbox`);
        const triggerVariant = optionWrapper.querySelector(`input[id='${targetID}']`);
        const continueWithBtn = document.querySelector(`.variant-step-btn .continue_with`);
        const getSellingPlanActivator = document.querySelector(`[data-sellingplan-activator]`);
        const variant_grid_price = Selectedtarget.querySelector('.per_bottel_price');
        const variant_grid_price_InnerText = variant_grid_price.querySelector('u').innerText;
       
        if(data_current_sku && document.querySelector(`.custom_sku`) != null){
          document.querySelector(`.custom_sku`).innerText = "- "+data_current_sku;
        }
        if(continueWithBtn){
          if(continueWithBtn.querySelector('span')){
            continueWithBtn.querySelector('span').innerText = targetValue;
          }
        }
        if(sellingPlanActivationCheckbox){
          const replace_checkbox_element = sellingPlanActivationCheckbox.querySelector('.replace_checkbox_subtext_price');
          const elementValue = replace_checkbox_element.value;
          if(sellingPlanActivationCheckbox.querySelector('.checkbox_subtext')){
            sellingPlanActivationCheckbox.querySelector('.checkbox_subtext').innerText = elementValue.replace('[price]', targetSellingSavingPrice);
          }
          
        }
        if(customATCButton && customATCButton.querySelector('.selling_plan_price')){
          const SellingPlanValue = getSellingPlanActivator.getAttribute('name');
          if(SellingPlanValue == '' || getSellingPlanActivator == null){
            customATCButton.querySelector('.selling_plan_price').innerText = targetMainPrice;
          } else{            
            customATCButton.querySelector('.selling_plan_price').innerText = targetSellingPrice;
          }
        }
        if(triggerVariant){
          triggerVariant.click();
        }
        setTimeout(()=>{          
          const getFormPriceElement = document.querySelector('[data-product-info] [data-product-price]');
          var popupBtn = document.querySelector(`[data-product-info] .product__submit__buttons .varient-custom-btn span`);
           
            const getFormPrice = getFormPriceElement.innerText
          // if(getFormPriceElement && popupBtn){
          //   popupBtn.innerText = getFormPrice;
          // }
         
          if(document.querySelector('[data-product-info] .popup_badge_price')){
            // document.querySelector('[data-product-info] .popup_badge_price').innerText = variant_grid_price_InnerText;
            // const current_varid = document.querySelector('#'+prod_id+' [name="id"]').value;
            // update_badgemetavalue(current_varid);
          }
          
        },100);
      }
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.querySelector('form.product__form');
    var arryvartitle = [];
    if (productForm) {
       const newidValue = productForm.querySelector('[name="id"]').value;
    
      if(document.querySelectorAll('.variant-inner-box')){
        
        updatevarincust(newidValue,productForm);
      }
      productForm.addEventListener('change', function(event) {
        const idValue = productForm.querySelector('[name="id"]').value;
        if(document.querySelector('[data-product-info] .popup_badge_price')){
          update_badgemetavalue(idValue);
        }
        if(document.querySelectorAll('.variant-inner-box')){
          updatevarincust(idValue,productForm);
        }
      });
    }
  });
  function updatevarincust(idValuem,productForm){
    
    const selectorWrappers = productForm.querySelectorAll('.product__selectors .selector-wrapper');
   
          let selectedValues = [];
          let fin = '';
          selectorWrappers.forEach(wrapper => {
          
            if (!wrapper.hasAttribute('hidden')) {}
              const selectedRadio = wrapper.querySelector('input[type="radio"]:checked');
             const selected_optiontit = wrapper.querySelector('.radio__legend__label').innerHTML;
              
              if (selectedRadio) {
                fin = " "+selectedRadio.value+" ";
                updatedbox_selectedoption(fin, idValuem,selected_optiontit);
              }else{
              
            }
          });
  }
  function updatedbox_selectedoption(opval,idValue,selected_optiontit){
    const variantBoxes = document.querySelectorAll('.variant-inner-box');
          variantBoxes.forEach((box, index) => {
            const attributeValue = box.getAttribute('variatn_cust_tit');
            const option_name_cust = box.getAttribute('option_name_cust');
          
          if(selected_optiontit != option_name_cust){
            if (attributeValue && attributeValue.includes(opval)) {
             box.classList.remove('hidden');
            }else{
              box.classList.add('hidden');
            }
          }
          });
  }
  function update_badgemetavalue(current_varid){

    const badges = document.querySelectorAll('.popup_badge_price');
    badges.forEach((badge) => {
      if(badge.getAttribute('data_checkid') == current_varid){
        badge.classList.remove('hidden');
      }else{
        badge.classList.add('hidden');
      }
    });
  }
  function handleSellingPlan(event){
    const currentTarget = event.currentTarget;
    const targetParent = currentTarget.closest('.variant-custom-model-wrap')
      if(targetParent){
        const sellingPlanActivator = targetParent.querySelector('[data-sellingplan-activator]');
        if(sellingPlanActivator){
          const ActivatorNameAttribute = sellingPlanActivator.getAttribute('name');
          const getSellingPriceFromSelectedVariant = document.querySelector(`[data-product-info] [data-position="Option1"] [name="variant-option-radio"]:checked`);
          if(ActivatorNameAttribute == '' || ActivatorNameAttribute == null){            
            sellingPlanActivator.setAttribute('name','selling_plan');
            if(getSellingPriceFromSelectedVariant){
              const sellingPrice = getSellingPriceFromSelectedVariant.getAttribute('data-selling-price');
              if(sellingPrice){
                if(customATCButton.querySelector('.selling_plan_price')){
                  customATCButton.querySelector('.selling_plan_price').innerText = sellingPrice;
                }
              }
            }
          } else{
            sellingPlanActivator.setAttribute('name','');
            if(getSellingPriceFromSelectedVariant){
              const MainPrice = getSellingPriceFromSelectedVariant.getAttribute('data-main-price');
              if(MainPrice){
                if(customATCButton.querySelector('.selling_plan_price')){
                  customATCButton.querySelector('.selling_plan_price').innerText = MainPrice;
                }
              }
            }
          }
        }
      }
  }

  function customOptionATCBtn(event){
    const currentButton = event.currentTarget;
    const closestFormButton = currentButton.closest('.product__submit__buttons');
    if(closestFormButton){
      closestFormButton.querySelector('button[name="add"]').click();
    }
  }
   

  // ^^ Keep your scripts inside this IIFE function call to
  // avoid leaking your variables into the global scope.
})();

document.addEventListener('DOMContentLoaded', function() {
    var popupMain = document.querySelector('.variant-custom-model-main');
    var popupTrigger = document.querySelector('.js-click-popup');
    var popupCloseBtn = document.querySelector('.variant-close-btn');
    var overlay = document.querySelector('.variant-bg-overlay');
    var firstStapbtn = document.querySelector('.btn-step-1');
    var modelWrap = document.querySelector('.variant-custom-model-wrap');
    var backStepbtn = document.querySelector('.js-back-btn');
  console.log('popupTrigger',popupTrigger);
    function openPopup() {
      backStep();
        popupMain.classList.add('variant-model-open');
      const firstChild = document.querySelectorAll('.variant-popup-img-option .variant-inner-box');
      for (let i = 0; i < firstChild.length; i++) {
        const wrapper = firstChild[i];
        if (!wrapper.classList.contains('hidden')) {
          wrapper.querySelector('input').click();
          break;
        }
      }
    }

    function closePopup() {
        popupMain.classList.remove('variant-model-open');
    }
    function firstStap() {
        modelWrap.classList.remove('step-1-active');
        modelWrap.classList.add('step-2-active');
    }
    function backStep() {
        modelWrap.classList.remove('step-2-active');
        modelWrap.classList.add('step-1-active');
    }

    popupTrigger.addEventListener('click', function() {
        openPopup();
    });

    popupCloseBtn.addEventListener('click', function() {
        closePopup();
    });

    overlay.addEventListener('click', function() {
        closePopup();
    });

    firstStapbtn.addEventListener('click', function() {
        firstStap();
    });

    backStepbtn.addEventListener('click', function() {
        backStep();
    });
  
});



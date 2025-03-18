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



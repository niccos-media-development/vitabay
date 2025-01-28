/*
* Palo Alto Theme
*
* Use this file to add custom Javascript to Palo Alto.  Keeping your custom
* Javascript in this fill will make it easier to update Palo Alto. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/


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
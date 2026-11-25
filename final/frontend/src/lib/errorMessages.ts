/**
 * Return Code Message Translator (Milestone 3 Table 3.1)
 * ---------------------------------------------------------------------------
 * Requirement 3.1(a):
 * "In case of an unsuccessful action, notify the user with the reason and the
 *  steps needed to correct the action. Use the return code of the Milestone 2
 *  procedure (Table 3.1) to choose the message; never show a raw SQL error or
 *  a bare error code."
 *
 * This module maps every Milestone 2 procedure action + return code (`0` or
 * `-1` through `-9`) into plain, helpful English telling the user BOTH what
 * went wrong and how to fix it.
 */

export type ActionKey =
  | "login"
  | "register_customer"
  | "register_partner"
  | "register_rider"
  | "change_password"
  | "create_admin"
  | "assign_admin_zone"
  | "approve_business"
  | "reject_business"
  | "suspend_business"
  | "reinstate_business"
  | "create_zone"
  | "update_zone_fee"
  | "issue_voucher"
  | "blacklist_customer"
  | "lift_blacklist"
  | "register_business"
  | "update_business_info"
  | "upsert_product"
  | "toggle_product_status"
  | "set_product_promotion"
  | "set_rider_availability"
  | "mark_picked_up"
  | "mark_delivered"
  | "add_address"
  | "update_address"
  | "delete_address"
  | "change_active_address"
  | "add_card"
  | "create_cart"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_cart"
  | "cancel_order"
  | "reorder"
  | "submit_feedback"
  | "rate_rider"
  | "toggle_favorite";

/** Default fallback messages matching Table 3.1 meanings. */
const GENERIC_BY_CODE: Record<number, string> = {
  0: "Action completed successfully.",
  [-1]: "Some of the information entered is invalid. Review the highlighted fields and try again.",
  [-2]: "This record already exists. Choose a different value and try again.",
  [-3]: "You are not allowed to perform this action with your current account or permissions.",
  [-4]: "This item is not in the right status for that action right now.",
  [-5]: "There is a delivery zone mismatch. Change your active address or pick a business in your zone.",
  [-6]: "You exceeded the maximum allowed limit. Lower the amount and try again.",
  [-7]: "Payment could not be completed with the selected method. Choose another payment method or check your card/wallet.",
  [-8]: "No rider is available in your zone right now. Please try again in a few minutes.",
  [-9]: "There is nothing to process. Add at least one available item before continuing.",
};

/** Specific user-friendly messages per action + return code. */
const ACTION_MESSAGES: Partial<Record<ActionKey, Partial<Record<number, string>>>> = {
  login: {
    0: "Signed in successfully.",
    [-1]: "Wrong username or password, or your account is not active. Double-check your credentials and try again.",
  },
  register_customer: {
    0: "Your customer account was created! You can now sign in.",
    [-1]: "Please fill in all required fields, use an 11-digit phone number (if provided), and make sure your date of birth is not in the future.",
    [-2]: "That username or email is already registered. Choose a different username or email.",
  },
  register_partner: {
    0: "Your partner account was created! Sign in to register and manage your business.",
    [-1]: "Please fill in all required fields, use an 11-digit phone number (if provided), and ensure your date of birth is in the past.",
    [-2]: "That username or email is already registered. Choose a different username or email.",
  },
  register_rider: {
    0: "Your rider account was created! Sign in to start accepting deliveries.",
    [-1]: "Complete all personal and vehicle details, select a valid zone, and use an 11-digit phone number.",
    [-2]: "Username, email, plate number, or license number is already registered. Enter unique details.",
  },
  change_password: {
    0: "Your password has been updated.",
    [-1]: "Check that your current password is correct, your new passwords match, and your new password differs from the old one.",
  },
  create_admin: {
    0: "New admin account created successfully.",
    [-1]: "Check all fields: Zone Admins must have a zone selected, Super Admins must have no zone, and phone must be 11 digits.",
    [-2]: "That username or email already exists. Pick a unique username and email.",
    [-3]: "Only a Super Admin can create new admin accounts.",
  },
  assign_admin_zone: {
    0: "Zone Admin assigned to the selected zone.",
    [-1]: "Select a valid Zone Admin and a valid delivery zone.",
    [-3]: "Only a Super Admin can assign or move Zone Admins.",
  },
  approve_business: {
    0: "Business approved and is now Active on the platform.",
    [-1]: "Business not found. Refresh the page and try again.",
    [-3]: "You can only approve businesses located inside your assigned zone.",
    [-4]: "Only businesses with status Pending can be approved.",
  },
  reject_business: {
    0: "Business application was rejected. The partner can update and re-submit it.",
    [-1]: "Business not found. Refresh the page and try again.",
    [-3]: "You can only reject businesses located inside your assigned zone.",
    [-4]: "Only businesses with status Pending can be rejected.",
  },
  suspend_business: {
    0: "Business suspended. Its products were hidden and pending sub-orders were cancelled and refunded.",
    [-1]: "Please provide a clear suspension reason before confirming.",
    [-3]: "You can only suspend businesses inside your assigned zone.",
    [-4]: "Only Active businesses can be suspended.",
  },
  reinstate_business: {
    0: "Business has been reinstated to Active status.",
    [-1]: "Business not found.",
    [-3]: "Only a Super Admin can reinstate a suspended business.",
    [-4]: "Only Suspended businesses can be reinstated.",
  },
  create_zone: {
    0: "New delivery zone created.",
    [-1]: "Enter a zone name and a non-negative delivery fee (0 or greater).",
    [-2]: "A zone with this name already exists. Choose a different zone name.",
    [-3]: "Only a Super Admin can create delivery zones.",
  },
  update_zone_fee: {
    0: "Zone delivery fee updated.",
    [-1]: "Enter a valid delivery fee (0 EGP or more) for a valid zone.",
    [-3]: "Only a Super Admin can change zone delivery fees.",
  },
  issue_voucher: {
    0: "Voucher issued to the customer.",
    [-1]: "Check the promo code, amount (percentage must be 1–100%), and pick today or a future expiry date.",
    [-2]: "This promo code already exists. Choose another code.",
    [-3]: "Vouchers cannot be issued to a blacklisted customer.",
  },
  blacklist_customer: {
    0: "Customer has been blacklisted, unused vouchers removed, and eligible orders cancelled/refunded.",
    [-1]: "Select a valid customer and enter a clear reason for blacklisting.",
    [-3]: "You can only blacklist customers whose active address is in your assigned zone.",
    [-4]: "This customer is already blacklisted.",
  },
  lift_blacklist: {
    0: "Customer blacklist lifted; their account is Active again.",
    [-3]: "Only the admin who originally placed this blacklist can lift it.",
    [-4]: "This customer is not currently blacklisted.",
  },
  register_business: {
    0: "Business submitted for admin approval (status: Pending).",
    [-1]: "Fill in all required fields, valid opening/closing hours, delivery time > 0, and an 11-digit phone number.",
    [-2]: "You already have a registered business. You can only re-submit if your previous application was Rejected.",
    [-3]: "Only signed-in Partner accounts can register a business.",
  },
  update_business_info: {
    0: "Business information updated.",
    [-1]: "Check your opening/closing hours and ensure any new phone number is exactly 11 digits.",
    [-2]: "That phone number is already listed on your business.",
  },
  upsert_product: {
    0: "Product saved successfully.",
    [-1]: "Provide a name, category, and price greater than 0 (ensure price keeps any existing discount at 50% or less).",
    [-3]: "You can only edit products belonging to your own business.",
    [-4]: "Your business is currently Suspended and cannot add or edit products.",
  },
  toggle_product_status: {
    0: "Product availability updated.",
    [-1]: "Product not found.",
    [-4]: "Products cannot be activated while your business is Suspended.",
  },
  set_product_promotion: {
    0: "Product discount updated.",
    [-1]: "The discount must be between 0 and 50% of the product's price. Enter a smaller amount.",
  },
  set_rider_availability: {
    0: "Your availability status was updated.",
    [-3]: "Only signed-in Rider accounts can change rider availability.",
  },
  mark_picked_up: {
    0: "Delivery marked as Picked Up.",
    [-1]: "Delivery record not found.",
    [-4]: "Only deliveries in Assigned status can be marked as Picked Up.",
  },
  mark_delivered: {
    0: "Delivery marked as Delivered! Great job.",
    [-1]: "Delivery record not found.",
    [-4]: "You must mark a delivery as Picked Up before marking it Delivered.",
  },
  add_address: {
    0: "New address added and set as your active address.",
    [-1]: "Enter an address description and choose a valid delivery zone.",
    [-3]: "Please sign in as a customer to manage addresses.",
  },
  update_address: {
    0: "Address updated.",
    [-1]: "Enter a valid address description and zone.",
    [-3]: "You can only edit your own addresses.",
    [-4]: "This address cannot be edited while it has an order that is Placed or In Progress.",
  },
  delete_address: {
    0: "Address deleted.",
    [-1]: "Address not found.",
    [-3]: "You can only delete your own addresses.",
    [-4]: "This address cannot be deleted because it is linked to an existing cart or order.",
  },
  change_active_address: {
    0: "Active delivery address switched.",
    [-3]: "You can only select one of your own saved addresses.",
  },
  add_card: {
    0: "Payment card saved (only the last 4 digits are displayed for security).",
    [-1]: "Enter a valid 16-digit card number, cardholder name, and a future expiration date.",
    [-2]: "This card is already saved to your account.",
  },
  create_cart: {
    0: "Active cart created for your current delivery address.",
    [-1]: "Add and select an active delivery address before creating a cart.",
    [-2]: "You already have an active cart for this address.",
    [-3]: "Your account is blacklisted, so you cannot create a cart.",
  },
  add_to_cart: {
    0: "Product added to your cart.",
    [-1]: "Select a valid product and quantity of at least 1.",
    [-4]: "This product is unavailable, the business is not active, or your cart does not match your active address.",
    [-5]: "This business does not deliver to your active address. Change your active address or choose another business.",
    [-6]: "You can order at most 10 of one product. Lower the quantity.",
  },
  remove_from_cart: {
    0: "Item removed from your cart.",
    [-1]: "That item is no longer in your cart.",
    [-4]: "You can only edit an active cart belonging to your current active address.",
  },
  checkout_cart: {
    0: "Order placed successfully! Riders have been assigned.",
    [-1]: "Select a valid payment method, and ensure any chosen voucher has not expired.",
    [-3]: "Your account is blacklisted, so you cannot check out. Contact support.",
    [-4]: "Checkout cannot proceed because a business is currently closed or inactive, a product became unavailable, or the voucher was already used.",
    [-5]: "A product in your cart is outside your active address's zone. Remove it or switch your active address.",
    [-7]: "Payment cannot be made: either your wallet balance is not enough or your selected card is expired/missing. Choose another method or add a valid card.",
    [-8]: "No rider is available in your zone right now. Try again in a few minutes.",
    [-9]: "Your cart is empty. Add products before checking out.",
  },
  cancel_order: {
    0: "Order cancelled and eligible payment refunded.",
    [-1]: "Order not found.",
    [-4]: "This order cannot be cancelled because it is already cancelled or a part of it was already picked up or delivered.",
  },
  reorder: {
    0: "Available items were added to a new active cart for that address!",
    [-1]: "Original order not found.",
    [-2]: "You already have an active cart for that address. Clear or check out that cart first.",
    [-3]: "Your account is blacklisted or the selected address does not belong to you.",
    [-5]: "Please choose an address in the same zone as the original order.",
    [-9]: "None of the items from that order are currently available from active businesses in that zone.",
  },
  submit_feedback: {
    0: "Thank you! Your business review has been submitted.",
    [-1]: "Please enter a headline and pick a rating from 1 to 5 stars.",
    [-2]: "You have already submitted feedback for this part of the order.",
    [-4]: "You can only leave feedback after this part of the order is Delivered.",
  },
  rate_rider: {
    0: "Thank you! Your rider rating has been recorded.",
    [-1]: "Please select a rating between 1 and 5 stars.",
    [-2]: "You have already rated the rider for this delivery.",
    [-4]: "You can only rate the rider after the delivery is completed.",
  },
  toggle_favorite: {
    0: "Favorites updated.",
    [-1]: "Item not found.",
    [-3]: "Sign in as a customer to save favorites.",
  },
};

export function translateReturnCode(action: ActionKey, code: number, customSuccess?: string): string {
  if (code === 0 && customSuccess) {
    return customSuccess;
  }
  const specific = ACTION_MESSAGES[action]?.[code];
  if (specific) return specific;
  return GENERIC_BY_CODE[code] ?? "Could not complete the request. Please review your input and try again.";
}

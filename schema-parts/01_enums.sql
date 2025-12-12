-- 1. Enum Types

CREATE TYPE errand_category AS ENUM ('DELIVERY', 'SHOPPING', 'CLEANING', 'QUEUEING', 'PET_CARE', 'BUG_CATCHING', 'OTHER');
CREATE TYPE errand_status AS ENUM ('OPEN', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE food_order_status AS ENUM ('pending', 'accepted', 'cooking', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled');
CREATE TYPE food_store_category AS ENUM ('korean', 'chinese', 'japanese', 'western', 'chicken', 'pizza', 'burger', 'snack', 'cafe', 'asian', 'lunchbox', 'nightfood', 'etc');
CREATE TYPE helper_grade AS ENUM ('NEWBIE', 'REGULAR', 'PRO', 'MASTER');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'trial');

<?php
require __DIR__ . '/../app/lib/AgeDobPage.php';
echo (new AgeDobPage('date-of-birth-calculator'))->render();

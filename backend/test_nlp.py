import pytest
from nlp_engine import parse_user_input

def test_diet_parsing():
    result = parse_user_input("ate 3 apples")
    assert "Diet/Nutrition" in result["parsed_category"]
    assert result["quantity"] == 3

def test_fitness_parsing():
    result = parse_user_input("ran 5 miles")
    assert "Fitness/Exercise" in result["parsed_category"]
    assert result["quantity"] == 5

def test_fallback_quantity():
    result = parse_user_input("drank water")
    assert result["quantity"] == 1
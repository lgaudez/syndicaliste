from calc import ratio, somme


def test_somme():
    assert somme([1, 2, 3]) == 6


def test_ratio():
    assert ratio(1, 4) == 0.25
